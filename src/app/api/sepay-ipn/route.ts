/**
 * SePay IPN (Instant Payment Notification) - Nhận thông báo thanh toán từ SePay
 * Doc: https://developer.sepay.vn/vi/cong-thanh-toan/bat-dau (Bước 3: Cấu hình IPN)
 *
 * Cấu hình IPN trên dashboard SePay:
 * - Production: https://<domain-cua-ban>/api/sepay-ipn
 * - Local test: dùng tunnel (ngrok, cloudflared) expose localhost:3000, điền https://<ngrok-host>/api/sepay-ipn
 * - Sau khi lưu IPN URL, bấm "Gửi test" trên dashboard để kiểm tra endpoint nhận JSON và trả 200.
 *
 * SePay gửi POST JSON khi giao dịch thành công (notification_type: ORDER_PAID).
 * Bắt buộc trả về HTTP 200 để xác nhận đã nhận.
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    const text = await request.text();
    if (text && text.trim()) {
      body = JSON.parse(text) as Record<string, unknown>;
    }
  } catch {
    // Gửi test có thể gửi body rỗng hoặc format khác - vẫn trả 200 để SePay coi là đã cấu hình
  }

  const notificationType = body?.notification_type;
  const order = body?.order as { order_invoice_number?: string; order_status?: string } | undefined;
  const invoiceNumber = order?.order_invoice_number;

  if (notificationType === 'ORDER_PAID') {
    if (invoiceNumber) {
      console.log('[SePay IPN] ORDER_PAID', invoiceNumber);
    }
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
