/**
 * SePay IPN (Instant Payment Notification) - Nhận thông báo thanh toán từ SePay
 * Doc: https://developer.sepay.vn/vi/cong-thanh-toan/bat-dau (Bước 3: Cấu hình IPN)
 *
 * ORDER_PAID: idempotency theo transaction_id; upsert nlc_accounts; ghi nlc_user_subscriptions + nlc_subscription_payments.
 * Mọi cập nhật và insert đều dùng user_id từ nlc_sepay_pending_orders để đảm bảo gắn đúng tài khoản.
 */

import { timingSafeEqual } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { sendPaymentSuccess } from '../../../lib/notification-email-server';

function verifySecretKey(headerValue: string | null, expectedSecret: string): boolean {
  if (!expectedSecret || !headerValue) return false;
  const expected = Buffer.from(expectedSecret, 'utf8');
  const received = Buffer.from(headerValue, 'utf8');
  if (expected.length !== received.length || expected.length === 0) return false;
  return timingSafeEqual(expected, received);
}

function parsePlanFromInvoice(invoiceNumber: string): 'premium' | 'partner' | null {
  if (!invoiceNumber || typeof invoiceNumber !== 'string') return null;
  const u = invoiceNumber.toUpperCase();
  if (u.startsWith('SUB_PREMIUM_')) return 'premium';
  if (u.startsWith('SUB_PARTNER_')) return 'partner';
  return null;
}

export async function POST(request: NextRequest) {
  const secretKey = process.env.SEPAY_SECRET_KEY ?? '';
  if (!secretKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const headerValue = request.headers.get('X-Secret-Key');
  if (!verifySecretKey(headerValue, secretKey)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: Record<string, unknown> = {};
  try {
    const text = await request.text();
    if (text && text.trim()) {
      try {
        body = JSON.parse(text) as Record<string, unknown>;
      } catch {
        // invalid JSON - leave body empty, still return 200
      }
    }
  } catch {
    // Body rỗng hoặc JSON không hợp lệ vẫn trả 200
  }

  const notificationType = body?.notification_type;
  const order = body?.order as { order_invoice_number?: string; order_status?: string } | undefined;
  const invoiceNumber = order?.order_invoice_number;

  if (notificationType === 'ORDER_PAID' && invoiceNumber) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey) {
      try {
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });

        // 1. Idempotency: đã xử lý invoice này rồi thì trả 200
        const { data: existingPayment } = await supabaseAdmin
          .from('nlc_subscription_payments')
          .select('id')
          .eq('transaction_id', invoiceNumber)
          .limit(1)
          .maybeSingle();
        if (existingPayment) {
          return NextResponse.json({ success: true }, { status: 200 });
        }

        const plan = parsePlanFromInvoice(invoiceNumber);
        if (!plan) {
          console.warn('[SePay IPN] Unknown plan from invoice', invoiceNumber);
          return NextResponse.json({ success: true }, { status: 200 });
        }

        const { data: pending } = await supabaseAdmin
          .from('nlc_sepay_pending_orders')
          .select('user_id, plan, amount_cents')
          .eq('order_invoice_number', invoiceNumber)
          .single();

        if (!pending?.user_id) {
          console.warn('[SePay IPN] No pending order for invoice', invoiceNumber);
          return NextResponse.json({ success: true }, { status: 200 });
        }

        const userId = pending.user_id as string;
        const amountCents = typeof pending.amount_cents === 'number' ? pending.amount_cents : plan === 'premium' ? 299000 : 199000;
        const amount = Number(amountCents);

        const { data: planRow } = await supabaseAdmin
          .from('nlc_subscription_plans')
          .select('id')
          .eq('plan_name', plan)
          .single();
        const planId = planRow?.id;
        if (!planId) {
          console.error('[SePay IPN] Plan not found in nlc_subscription_plans', plan);
          return NextResponse.json({ success: true }, { status: 200 });
        }

        // 2. Đảm bảo nlc_accounts tồn tại (upsert từ auth.users nếu chưa có)
        const { data: existingAccount } = await supabaseAdmin
          .from('nlc_accounts')
          .select('id')
          .eq('user_id', userId)
          .maybeSingle();

        if (!existingAccount) {
          const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId);
          const email = authUser?.user?.email ?? '';
          const fullName = authUser?.user?.user_metadata?.full_name ?? email?.split('@')[0] ?? 'User';
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30);
          const { error: insertAccErr } = await supabaseAdmin.from('nlc_accounts').insert({
            user_id: userId,
            email: email || `pending-${userId}@nlc`,
            full_name: fullName,
            account_role: 'sinh_vien',
            account_status: 'active',
            subscription_plan: plan,
            subscription_expires_at: expiresAt.toISOString(),
            subscription_status: 'active',
            email_verified: !!authUser?.user?.email_confirmed_at,
          });
          if (insertAccErr) {
            console.error('[SePay IPN] Insert nlc_accounts error', insertAccErr);
          }
        }

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const { error: updateErr } = await supabaseAdmin
          .from('nlc_accounts')
          .update({
            subscription_plan: plan,
            subscription_expires_at: expiresAt.toISOString(),
            subscription_status: 'active',
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', userId);

        if (updateErr) {
          console.error('[SePay IPN] Update nlc_accounts error', updateErr);
        }

        // 3. Cancel old active subscriptions, insert new nlc_user_subscriptions
        await supabaseAdmin
          .from('nlc_user_subscriptions')
          .update({ status: 'cancelled', cancelled_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('user_id', userId)
          .eq('status', 'active');

        const { data: newSub, error: subErr } = await supabaseAdmin
          .from('nlc_user_subscriptions')
          .insert({
            user_id: userId,
            plan_id: planId,
            status: 'active',
            expires_at: expiresAt.toISOString(),
            payment_method: 'sepay',
            transaction_id: invoiceNumber,
            amount_paid: amount,
          })
          .select('id')
          .single();

        if (subErr || !newSub?.id) {
          console.error('[SePay IPN] Insert nlc_user_subscriptions error', subErr);
        } else {
          await supabaseAdmin.from('nlc_subscription_payments').insert({
            subscription_id: newSub.id,
            user_id: userId,
            plan_id: planId,
            amount,
            currency: 'VND',
            payment_method: 'sepay',
            payment_status: 'completed',
            transaction_id: invoiceNumber,
          });
        }

        await supabaseAdmin.from('nlc_sepay_pending_orders').delete().eq('order_invoice_number', invoiceNumber);

        const { data: account } = await supabaseAdmin
          .from('nlc_accounts')
          .select('email, full_name')
          .eq('user_id', userId)
          .single();
        if (account?.email) {
          try {
            await sendPaymentSuccess(
              account.email,
              (account.full_name as string) || account.email,
              { plan, amount: String(amount) }
            );
          } catch (emailErr) {
            console.error('[SePay IPN] Send payment success email error', emailErr);
          }
        }
      } catch (err) {
        console.error('[SePay IPN] DB error', err);
      }
    }
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
