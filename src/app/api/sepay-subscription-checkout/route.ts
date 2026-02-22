/**
 * SePay Subscription Checkout API - Thanh toán gói Premium/Partner (server-side, bảo mật)
 * Số tiền và mã đơn do server quyết định; client chỉ gửi plan. Optional user_id để IPN cập nhật nlc_accounts.
 *
 * POST /api/sepay-subscription-checkout
 * Body: { plan: 'premium' | 'partner', user_id?: string }
 * Response: { checkoutURL, formFields }
 */

import { randomBytes } from 'crypto';
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { SePayPgClient } from 'sepay-pg-node';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MERCHANT_ID = process.env.SEPAY_MERCHANT_ID || '';
const SECRET_KEY = process.env.SEPAY_SECRET_KEY || '';
const ENV = (process.env.SEPAY_ENV || 'sandbox') as 'sandbox' | 'production';

const FALLBACK_AMOUNTS: Record<string, number> = {
  premium: 299000,
  partner: 199000,
};
const FALLBACK_DESCRIPTIONS: Record<string, string> = {
  premium: 'Đăng ký gói Hội viên Premium - 1 tháng',
  partner: 'Đăng ký gói Đối tác - 1 tháng',
};

function getOrigin(request: NextRequest): string {
  const origin = request.headers.get('origin');
  if (origin) return origin;
  try {
    return new URL(request.url).origin;
  } catch {
    return '';
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const plan = typeof body.plan === 'string' ? body.plan.toLowerCase() : '';

    if (plan !== 'premium' && plan !== 'partner') {
      return NextResponse.json(
        { error: 'Plan không hợp lệ. Chỉ chấp nhận premium hoặc partner.' },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!MERCHANT_ID || !SECRET_KEY) {
      return NextResponse.json(
        { error: 'Chưa cấu hình SePay (SEPAY_MERCHANT_ID, SEPAY_SECRET_KEY)' },
        { status: 500, headers: corsHeaders }
      );
    }

    const origin = getOrigin(request);
    if (!origin) {
      return NextResponse.json(
        { error: 'Không xác định được origin' },
        { status: 400, headers: corsHeaders }
      );
    }

    const finalSuccessUrl = `${origin}/thanh-cong/${plan}`;
    const finalErrorUrl = `${origin}/goi-dich-vu?status=error`;
    const finalCancelUrl = `${origin}/goi-dich-vu?status=cancel`;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY;
    let amount = FALLBACK_AMOUNTS[plan];
    let order_description = FALLBACK_DESCRIPTIONS[plan];
    if (supabaseUrl && serviceRoleKey) {
      try {
        const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
        const { data: planRow } = await supabaseAdmin
          .from('nlc_subscription_plans')
          .select('id, price, display_name')
          .eq('plan_name', plan)
          .eq('is_active', true)
          .single();
        if (planRow) {
          amount = Number(planRow.price) || amount;
          order_description = `Đăng ký gói ${planRow.display_name || plan} - 1 tháng`;
        }
      } catch (err) {
        console.warn('[SePay Subscription Checkout] Fetch plan from DB failed, using fallback', err);
      }
    }

    const order_invoice_number = `SUB_${plan.toUpperCase()}_${Date.now()}_${randomBytes(4).toString('hex')}`;

    const userId = typeof body.user_id === 'string' && UUID_REGEX.test(body.user_id.trim()) ? body.user_id.trim() : null;
    if (userId && supabaseUrl && serviceRoleKey) {
      const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
      const { data: existingAccount } = await supabaseAdmin
        .from('nlc_accounts')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();
      const { data: authUser } = await supabaseAdmin.auth.admin.getUserById(userId).catch(() => ({ data: null }));
      if (!existingAccount && !authUser?.user) {
        return NextResponse.json(
          { error: 'user_id không tồn tại trong hệ thống' },
          { status: 404, headers: corsHeaders }
        );
      }
      try {
        await supabaseAdmin.from('nlc_sepay_pending_orders').insert({
          order_invoice_number,
          user_id: userId,
          plan,
          amount_cents: amount,
        });
      } catch (err) {
        console.warn('[SePay Subscription Checkout] Pending order insert failed', err);
      }
    }

    const client = new SePayPgClient({
      env: ENV,
      merchant_id: MERCHANT_ID,
      secret_key: SECRET_KEY,
    });

    const checkoutURL = client.checkout.initCheckoutUrl();
    const formFields = client.checkout.initOneTimePaymentFields({
      payment_method: 'BANK_TRANSFER',
      order_invoice_number,
      order_amount: amount,
      currency: 'VND',
      order_description,
      success_url: finalSuccessUrl,
      error_url: finalErrorUrl,
      cancel_url: finalCancelUrl,
    });

    return NextResponse.json(
      { checkoutURL, formFields },
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error('[SePay Subscription Checkout] Error', err);
    return NextResponse.json(
      { error: 'Lỗi tạo phiên thanh toán SePay' },
      { status: 500, headers: corsHeaders }
    );
  }
}
