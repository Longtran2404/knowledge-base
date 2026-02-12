/**
 * SePay IPN (Instant Payment Notification) - Nhận thông báo thanh toán từ SePay
 * Doc: https://developer.sepay.vn/vi/cong-thanh-toan/bat-dau (Bước 3: Cấu hình IPN)
 *
 * Trong dashboard SePay > Cấu hình IPN: nhập URL dạng https://your-domain.com/api/sepay-ipn
 * SePay gửi POST JSON khi giao dịch thành công (notification_type: ORDER_PAID).
 * Bắt buộc trả về HTTP 200 để xác nhận đã nhận.
 */

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  let body;
  try {
    body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  } catch {
    return res.status(400).send('Invalid JSON');
  }

  // Chỉ log tối thiểu (tránh log dữ liệu nhạy cảm)
  const notificationType = body.notification_type;
  const orderId = body.order?.order_id;
  const invoiceNumber = body.order?.order_invoice_number;
  const status = body.order?.order_status;

  if (notificationType === 'ORDER_PAID') {
    // Giao dịch thanh toán thành công - cập nhật đơn hàng trong DB của bạn tại đây
    // Ví dụ: await updateOrderStatus(invoiceNumber, 'paid');
    if (invoiceNumber) {
      console.log('[SePay IPN] ORDER_PAID', invoiceNumber);
    }
  }

  // Luôn trả 200 để SePay biết đã nhận thông báo
  res.status(200).json({ success: true });
};
