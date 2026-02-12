/**
 * SePay Checkout API - Tạo form thanh toán SePay (QR chuyển khoản)
 * Doc: https://developer.sepay.vn/vi/cong-thanh-toan/bat-dau
 *
 * POST /api/sepay-checkout
 * Body: { order_invoice_number, order_amount, order_description?, success_url, error_url, cancel_url }
 * Response: { checkoutURL, formFields }
 */

const { SePayPgClient } = require('sepay-pg-node');

// CHỈ dùng biến môi trường server - KHÔNG dùng REACT_APP_* (dễ lộ secret khi build frontend)
const MERCHANT_ID = process.env.SEPAY_MERCHANT_ID || '';
const SECRET_KEY = process.env.SEPAY_SECRET_KEY || '';
const ENV = process.env.SEPAY_ENV || 'sandbox';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const {
      order_invoice_number,
      order_amount,
      order_description = 'Thanh toan don hang',
      success_url,
      error_url,
      cancel_url,
    } = req.body || {};

    if (!order_invoice_number || order_amount == null || !success_url || !error_url || !cancel_url) {
      return res.status(400).json({
        error: 'Thiếu tham số',
        required: ['order_invoice_number', 'order_amount', 'success_url', 'error_url', 'cancel_url'],
      });
    }

    if (!MERCHANT_ID || !SECRET_KEY) {
      return res.status(500).json({
        error: 'Chưa cấu hình SePay (SEPAY_MERCHANT_ID, SEPAY_SECRET_KEY)',
      });
    }

    const client = new SePayPgClient({
      env: ENV,
      merchant_id: MERCHANT_ID,
      secret_key: SECRET_KEY,
    });

    const checkoutURL = client.checkout.initCheckoutUrl();
    const checkoutFormfields = client.checkout.initOneTimePaymentFields({
      payment_method: 'BANK_TRANSFER',
      order_invoice_number: String(order_invoice_number),
      order_amount: Number(order_amount),
      currency: 'VND',
      order_description: order_description || `Thanh toan don hang ${order_invoice_number}`,
      success_url,
      error_url,
      cancel_url,
    });

    return res.status(200).json({
      checkoutURL,
      formFields: checkoutFormfields,
    });
  } catch (err) {
    // Không log message lỗi chi tiết có thể chứa thông tin nhạy cảm
    console.error('[SePay Checkout] Error');
    return res.status(500).json({
      error: err.message || 'Lỗi tạo phiên thanh toán SePay',
    });
  }
};
