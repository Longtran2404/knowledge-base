/**
 * GET /api/my-ip
 * Trả về IP của client (từ proxy headers hoặc connection).
 */

import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown';
  return NextResponse.json({ ip });
}
