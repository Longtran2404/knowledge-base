/**
 * POST /api/send-notification
 * Gửi email thông báo (thanh toán, welcome, đăng nhập mới, tài liệu).
 * Chỉ chấp nhận khi có header X-Notification-Secret trùng NOTIFICATION_SECRET (hoặc gọi nội bộ từ server).
 */

import { NextRequest, NextResponse } from "next/server";
import * as notificationEmail from "../../../lib/notification-email-server";

function verifySecret(headerValue: string | null): boolean {
  const secret = process.env.NOTIFICATION_SECRET ?? "";
  if (!secret) return false;
  return headerValue === secret;
}

export async function POST(request: NextRequest) {
  const headerValue = request.headers.get("X-Notification-Secret");
  if (!verifySecret(headerValue)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    type?: string;
    toEmail?: string;
    toName?: string;
    plan?: string;
    amount?: string;
    reason?: string;
    ip?: string;
    location?: string;
    courseName?: string;
    link?: string;
    instructions?: string;
  } = {};
  try {
    const text = await request.text();
    if (text?.trim()) body = JSON.parse(text) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { type, toEmail, toName } = body;
  if (!type || !toEmail || !toName) {
    return NextResponse.json(
      { error: "Missing type, toEmail or toName" },
      { status: 400 }
    );
  }

  let result: notificationEmail.NotificationEmailResult;
  switch (type) {
    case "payment_success":
      result = await notificationEmail.sendPaymentSuccess(toEmail, toName, {
        plan: body.plan,
        amount: body.amount,
      });
      break;
    case "payment_failure":
      result = await notificationEmail.sendPaymentFailure(toEmail, toName, {
        reason: body.reason,
      });
      break;
    case "welcome":
      result = await notificationEmail.sendWelcome(toEmail, toName);
      break;
    case "login_new_ip":
      result = await notificationEmail.sendLoginNewIp(toEmail, toName, {
        ip: body.ip,
        location: body.location,
      });
      break;
    case "course_material_received":
      result = await notificationEmail.sendCourseMaterialReceived(toEmail, toName, {
        courseName: body.courseName,
        link: body.link,
        instructions: body.instructions,
      });
      break;
    default:
      return NextResponse.json({ error: "Unknown type: " + type }, { status: 400 });
  }

  if (!result.success) {
    return NextResponse.json(
      { error: result.message, details: result.error },
      { status: 500 }
    );
  }
  return NextResponse.json({ success: true, message: result.message }, { status: 200 });
}
