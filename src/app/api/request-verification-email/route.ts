/**
 * POST /api/request-verification-email
 * Gửi email xác thực từ Gmail (public: chỉ cần email). API tự tạo token và link.
 * Nên rate limit theo IP/email trong production.
 */

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { sendVerificationEmail } from "../../../lib/gmail-sender";

const SECRET = process.env.NOTIFICATION_SECRET || process.env.REACT_APP_JWT_SECRET || "verify-email-secret";
const TOKEN_EXPIRY = "24h";

function getBaseUrl(request: NextRequest): string {
  const origin = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";
  if (origin) return `${proto === "https" ? "https" : "http"}://${origin}`;
  return process.env.REACT_APP_DEPLOYMENT_URL || process.env.REACT_APP_APP_URL || "http://localhost:3000";
}

export async function POST(request: NextRequest) {
  let body: { email?: string; userName?: string } = {};
  try {
    const text = await request.text();
    if (text?.trim()) body = JSON.parse(text) as typeof body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json(
      { error: "Email không hợp lệ" },
      { status: 400 }
    );
  }

  const baseUrl = getBaseUrl(request).replace(/\/$/, "");
  const token = jwt.sign(
    { email },
    SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
  const verifyLink = `${baseUrl}/xac-minh-email?token=${encodeURIComponent(token)}`;

  const result = await sendVerificationEmail(email, verifyLink, body.userName);

  if (!result.success) {
    return NextResponse.json(
      { error: result.message, details: result.error },
      { status: 500 }
    );
  }
  return NextResponse.json(
    { success: true, message: "Đã gửi email xác thực. Kiểm tra hộp thư." },
    { status: 200 }
  );
}
