/**
 * Gửi email từ Gmail qua Nodemailer OAuth2 (galamot1@gmail.com hoặc GMAIL_USER).
 * Cần GMAIL_USER, GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, GMAIL_REFRESH_TOKEN trong env.
 * Xem docs/GMAIL_OAUTH_SETUP.md để lấy refresh_token.
 */

import nodemailer from "nodemailer";

export interface GmailSendResult {
  success: boolean;
  message: string;
  error?: string;
}

function getConfig() {
  const user = process.env.GMAIL_USER ?? "";
  const clientId = process.env.GMAIL_CLIENT_ID ?? "";
  const clientSecret = process.env.GMAIL_CLIENT_SECRET ?? "";
  const refreshToken = process.env.GMAIL_REFRESH_TOKEN ?? "";
  return { user, clientId, clientSecret, refreshToken };
}

function isConfigured(): boolean {
  const { user, clientId, clientSecret, refreshToken } = getConfig();
  return !!(user && clientId && clientSecret && refreshToken);
}

function createTransporter() {
  const { user, clientId, clientSecret, refreshToken } = getConfig();
  return nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user,
      clientId,
      clientSecret,
      refreshToken,
    },
  });
}

/**
 * Gửi email xác thực tới người dùng (link xác thực trong nội dung).
 */
export async function sendVerificationEmail(
  to: string,
  verifyLink: string,
  userName?: string
): Promise<GmailSendResult> {
  if (!isConfigured()) {
    return {
      success: false,
      message: "Gmail chưa cấu hình",
      error: "Thiếu GMAIL_USER, GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET hoặc GMAIL_REFRESH_TOKEN",
    };
  }
  const from = getConfig().user;
  const name = userName || to.split("@")[0];
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: sans-serif; line-height: 1.5;">
  <p>Xin chào ${escapeHtml(name)},</p>
  <p>Bạn đã đăng ký tài khoản. Vui lòng xác thực email bằng cách bấm vào link dưới đây:</p>
  <p><a href="${escapeHtml(verifyLink)}" style="color: #2563eb;">Xác thực email</a></p>
  <p>Hoặc copy link sau vào trình duyệt:</p>
  <p style="word-break: break-all;">${escapeHtml(verifyLink)}</p>
  <p>Link có hiệu lực trong 24 giờ.</p>
  <p>Nếu bạn không đăng ký, hãy bỏ qua email này.</p>
  <hr/>
  <p style="color: #6b7280; font-size: 0.875rem;">Knowledge Base / Nam Long Center</p>
</body>
</html>`;
  const subject = "Xác thực email - Knowledge Base";

  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Knowledge Base" <${from}>`,
      to,
      subject,
      html,
    });
    return { success: true, message: "Email xác thực đã gửi" };
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    if (process.env.NODE_ENV === "development") {
      console.error("[gmail-sender] sendVerificationEmail error:", errMsg);
    }
    return {
      success: false,
      message: "Gửi email thất bại",
      error: errMsg,
    };
  }
}

/**
 * Gửi thông báo tùy chỉnh (subject + html).
 */
export async function sendNotification(
  to: string,
  subject: string,
  html: string
): Promise<GmailSendResult> {
  if (!isConfigured()) {
    return {
      success: false,
      message: "Gmail chưa cấu hình",
      error: "Thiếu biến môi trường Gmail OAuth2",
    };
  }
  const from = getConfig().user;
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"Knowledge Base" <${from}>`,
      to,
      subject,
      html,
    });
    return { success: true, message: "Email đã gửi" };
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    if (process.env.NODE_ENV === "development") {
      console.error("[gmail-sender] sendNotification error:", errMsg);
    }
    return {
      success: false,
      message: "Gửi email thất bại",
      error: errMsg,
    };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
