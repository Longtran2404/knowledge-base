/**
 * SePay Subscription Checkout API - Thanh toán gói Premium/Partner (server-side, bảo mật)
 * Số tiền và mã đơn do server quyết định; client chỉ gửi plan.
 *
 * POST /api/sepay-subscription-checkout
 * Body: { plan: 'premium' | 'partner', success_url?, error_url?, cancel_url? }
 * Response: { checkoutURL, formFields }
 */

import { randomBytes } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { SePayPgClient } from 'sepay-pg-node';

const MERCHANT_ID = process.env.SEPAY_MERCHANT_ID || '';
const SECRET_KEY = process.env.SEPAY_SECRET_KEY || '';
const ENV = (process.env.SEPAY_ENV || 'sandbox') as 'sandbox' | 'production';

const PLAN_AMOUNTS: Record<string, number> = {
  premium: 299000,
  partner: 199000,
};

const PLAN_DESCRIPTIONS: Record<string, string> = {
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

    const amount = PLAN_AMOUNTS[plan];
    const order_description = PLAN_DESCRIPTIONS[plan];
    const order_invoice_number = `SUB_${plan.toUpperCase()}_${Date.now()}_${randomBytes(4).toString('hex')}`;

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
