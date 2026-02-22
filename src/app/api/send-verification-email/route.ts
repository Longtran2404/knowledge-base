/**
 * POST /api/send-verification-email
 * Gửi email xác thực từ Gmail (galamot1@gmail.com).
 * Bảo vệ: header X-Notification-Secret trùng NOTIFICATION_SECRET.
 */

import { NextRequest, NextResponse } from "next/server";
import { sendVerificationEmail } from "../../../lib/gmail-sender";

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

  let body: { email?: string; verifyLink?: string; userName?: string } = {};
  try {
    const text = await request.text();
    if (text?.trim()) body = JSON.parse(text) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { email, verifyLink, userName } = body;
  if (!email || !verifyLink) {
    return NextResponse.json(
      { error: "Missing email or verifyLink" },
      { status: 400 }
    );
  }

  const result = await sendVerificationEmail(email, verifyLink, userName);

  if (!result.success) {
    return NextResponse.json(
      { error: result.message, details: result.error },
      { status: 500 }
    );
  }
  return NextResponse.json(
    { success: true, message: result.message },
    { status: 200 }
  );
}
