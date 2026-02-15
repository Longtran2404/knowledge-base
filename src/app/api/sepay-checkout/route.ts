/**
 * SePay Checkout API - Tạo form thanh toán SePay (QR chuyển khoản)
 * Doc: https://developer.sepay.vn/vi/cong-thanh-toan/bat-dau
 *
 * POST /api/sepay-checkout
 * Body: { order_invoice_number, order_amount, order_description?, success_url, error_url, cancel_url }
 * Response: { checkoutURL, formFields }
 */

import { NextRequest, NextResponse } from 'next/server';
import { SePayPgClient } from 'sepay-pg-node';

const MERCHANT_ID = process.env.SEPAY_MERCHANT_ID || '';
const SECRET_KEY = process.env.SEPAY_SECRET_KEY || '';
const ENV = (process.env.SEPAY_ENV || 'sandbox') as 'sandbox' | 'production';

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
    const {
      order_invoice_number,
      order_amount,
      order_description = 'Thanh toan don hang',
      success_url,
      error_url,
      cancel_url,
    } = body;

    if (
      !order_invoice_number ||
      order_amount == null ||
      !success_url ||
      !error_url ||
      !cancel_url
    ) {
      return NextResponse.json(
        {
          error: 'Thiếu tham số',
          required: [
            'order_invoice_number',
            'order_amount',
            'success_url',
            'error_url',
            'cancel_url',
          ],
        },
        { status: 400, headers: corsHeaders }
      );
    }

    if (!MERCHANT_ID || !SECRET_KEY) {
      return NextResponse.json(
        {
          error: 'Chưa cấu hình SePay (SEPAY_MERCHANT_ID, SEPAY_SECRET_KEY)',
        },
        { status: 500, headers: corsHeaders }
      );
    }

    const client = new SePayPgClient({
      env: ENV,
      merchant_id: MERCHANT_ID,
      secret_key: SECRET_KEY,
    });

    const checkoutURL = client.checkout.initCheckoutUrl();
    const formFields = client.checkout.initOneTimePaymentFields({
      payment_method: 'BANK_TRANSFER',
      order_invoice_number: String(order_invoice_number),
      order_amount: Number(order_amount),
      currency: 'VND',
      order_description: order_description || `Thanh toan don hang ${order_invoice_number}`,
      success_url,
      error_url,
      cancel_url,
    });

    return NextResponse.json(
      { checkoutURL, formFields },
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    console.error('[SePay Checkout] Error', err);
    return NextResponse.json(
      { error: 'Lỗi tạo phiên thanh toán SePay' },
      { status: 500, headers: corsHeaders }
    );
  }
}
