/**
 * POST /api/notify-payment-failure
 * Gửi email thông báo thanh toán thất bại (user đã đăng nhập).
 * Header: Authorization: Bearer <Supabase access_token>
 * Body (optional): { reason?: string }
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { sendPaymentFailure } from '../../../lib/notification-email-server';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  const jwt = authHeader?.replace(/^Bearer\s+/i, '').trim();
  if (!jwt) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.REACT_APP_SUPABASE_URL;
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnon) {
    return NextResponse.json({ error: 'Server config error' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseAnon, {
    global: { headers: { Authorization: `Bearer ${jwt}` } },
  });

  const { data: { user }, error: userError } = await supabase.auth.getUser(jwt);
  if (userError || !user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  let body: { reason?: string } = {};
  try {
    const text = await request.text();
    if (text?.trim()) {
      try {
        body = JSON.parse(text) as { reason?: string };
      } catch {
        // invalid JSON - leave body empty
      }
    }
  } catch {
    // empty body is ok
  }

  const { data: account, error: accountError } = await supabase
    .from('nlc_accounts')
    .select('email, full_name')
    .single();

  if (accountError || !account?.email) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  const toEmail = account.email as string;
  const toName = (account.full_name as string) || toEmail;
  try {
    await sendPaymentFailure(toEmail, toName, { reason: body.reason ?? 'Thanh toán chưa hoàn tất' });
  } catch (e) {
    console.error('[notify-payment-failure] Send email error', e);
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
