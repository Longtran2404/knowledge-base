/**
 * SePay IPN (Instant Payment Notification) - Nhận thông báo thanh toán từ SePay
 * Doc: https://developer.sepay.vn/vi/cong-thanh-toan/bat-dau (Bước 3: Cấu hình IPN)
 * IPN auth: https://developer.sepay.vn/en/cong-thanh-toan/IPN
 *
 * Cấu hình IPN trên dashboard SePay:
 * - Production: https://<domain-cua-ban>/api/sepay-ipn
 * - Local test: dùng tunnel (ngrok, cloudflared) expose localhost:3000, điền https://<ngrok-host>/api/sepay-ipn
 * - Bắt buộc chọn "Loại xác thực = SECRET_KEY" để SePay gửi header X-Secret-Key; endpoint kiểm tra header này để chống giả mạo.
 * - Sau khi lưu IPN URL, bấm "Gửi test" (khi đã bật SECRET_KEY) để kiểm tra.
 *
 * SePay gửi POST JSON khi giao dịch thành công (notification_type: ORDER_PAID).
 * Bắt buộc trả về HTTP 200 để xác nhận đã nhận.
 */

import { timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

function verifySecretKey(headerValue: string | null, expectedSecret: string): boolean {
  if (!expectedSecret || !headerValue) return false;
  const expected = Buffer.from(expectedSecret, 'utf8');
  const received = Buffer.from(headerValue, 'utf8');
  if (expected.length !== received.length || expected.length === 0) return false;
  return timingSafeEqual(expected, received);
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
      body = JSON.parse(text) as Record<string, unknown>;
    }
  } catch {
    // Body rỗng hoặc JSON không hợp lệ vẫn trả 200 để SePay coi là đã nhận
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
