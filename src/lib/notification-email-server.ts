/**
 * Server-side notification email sender (API routes / Node).
 * Uses EmailJS REST API so it works without @emailjs/browser.
 */

const EMAILJS_SEND_URL = "https://api.emailjs.com/api/v1.0/email/send";

function getConfig() {
  const serviceId =
    process.env.REACT_APP_EMAILJS_SERVICE_ID ||
    process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID ||
    "service_knowledgebase";
  const publicKey =
    process.env.REACT_APP_EMAILJS_PUBLIC_KEY ||
    process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ||
    "";
  return { serviceId, publicKey };
}

export interface NotificationEmailResult {
  success: boolean;
  message: string;
  error?: string;
}

async function sendTemplate(
  templateId: string,
  templateParams: Record<string, string>
): Promise<NotificationEmailResult> {
  const { serviceId, publicKey } = getConfig();
  if (!publicKey) {
    return { success: false, message: "EmailJS chưa cấu hình", error: "Missing public key" };
  }
  try {
    const res = await fetch(EMAILJS_SEND_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        template_params: {
          ...templateParams,
          app_name: "Knowledge Base",
          support_email: "info@knowledgebase.com",
        },
      }),
    });
    const text = await res.text();
    if (!res.ok) {
      return { success: false, message: "Gửi email thất bại", error: text || String(res.status) };
    }
    return { success: true, message: "Email đã gửi" };
  } catch (e) {
    const errMsg = e instanceof Error ? e.message : String(e);
    return { success: false, message: "Lỗi gửi email", error: errMsg };
  }
}

const TEMPLATES = {
  payment_success: "payment_success",
  payment_failure: "payment_failure",
  welcome: "welcome",
  login_new_ip: "login_new_ip",
  course_material_received: "course_material_received",
} as const;

export async function sendPaymentSuccess(
  toEmail: string,
  toName: string,
  payload: { plan?: string; amount?: string }
): Promise<NotificationEmailResult> {
  return sendTemplate(TEMPLATES.payment_success, {
    to_email: toEmail,
    to_name: toName,
    plan: payload.plan ?? "",
    amount: payload.amount ?? "",
  });
}

export async function sendPaymentFailure(
  toEmail: string,
  toName: string,
  payload: { reason?: string }
): Promise<NotificationEmailResult> {
  return sendTemplate(TEMPLATES.payment_failure, {
    to_email: toEmail,
    to_name: toName,
    reason: payload.reason ?? "Không xác định",
  });
}

export async function sendWelcome(
  toEmail: string,
  toName: string
): Promise<NotificationEmailResult> {
  return sendTemplate(TEMPLATES.welcome, {
    to_email: toEmail,
    to_name: toName,
  });
}

export async function sendLoginNewIp(
  toEmail: string,
  toName: string,
  payload: { ip?: string; location?: string }
): Promise<NotificationEmailResult> {
  return sendTemplate(TEMPLATES.login_new_ip, {
    to_email: toEmail,
    to_name: toName,
    ip: payload.ip ?? "",
    location: payload.location ?? "",
  });
}

export async function sendCourseMaterialReceived(
  toEmail: string,
  toName: string,
  payload: { courseName?: string; link?: string; instructions?: string }
): Promise<NotificationEmailResult> {
  return sendTemplate(TEMPLATES.course_material_received, {
    to_email: toEmail,
    to_name: toName,
    course_name: payload.courseName ?? "",
    link: payload.link ?? "",
    instructions: payload.instructions ?? "",
  });
}
