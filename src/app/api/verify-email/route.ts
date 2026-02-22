/**
 * GET /api/verify-email?token=<jwt>
 * Xác thực token do backend phát hành (JWT). Dùng cho link trong email gửi từ Gmail.
 */

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const SECRET = process.env.NOTIFICATION_SECRET || process.env.REACT_APP_JWT_SECRET || "verify-email-secret";

export interface VerifyEmailPayload {
  email: string;
  exp?: number;
}

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json(
      { success: false, error: "Missing token" },
      { status: 400 }
    );
  }

  try {
    const decoded = jwt.verify(token, SECRET) as VerifyEmailPayload;
    const email = decoded?.email;
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid token payload" },
        { status: 400 }
      );
    }
    return NextResponse.json({ success: true, email });
  } catch {
    return NextResponse.json(
      { success: false, error: "Token không hợp lệ hoặc đã hết hạn" },
      { status: 400 }
    );
  }
}
