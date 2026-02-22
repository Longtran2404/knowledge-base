/**
 * POST /api/register-login
 * Ghi nhận lần đăng nhập (last_login_ip, last_login_at), đồng bộ user_metadata vào nlc_accounts, gửi email cảnh báo nếu IP khác lần trước.
 * Header: Authorization: Bearer <Supabase access_token>
 * Body (optional): { ip?: string } – nếu không gửi, server lấy IP từ request headers.
 */

import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { sendLoginNewIp, sendWelcome } from '../../../lib/notification-email-server';

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const real = request.headers.get('x-real-ip');
  if (real) return real.trim();
  const vercel = request.headers.get('x-vercel-forwarded-for');
  if (vercel) return vercel.split(',')[0].trim();
  return '';
}

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

  let body: { ip?: string } = {};
  try {
    const text = await request.text();
    if (text?.trim()) {
      try {
        body = JSON.parse(text) as { ip?: string };
      } catch {
        // invalid JSON - leave body empty
      }
    }
  } catch {
    // empty or invalid body is ok
  }

  const ip = body.ip?.trim() || getClientIp(request);
  if (!ip) {
    return NextResponse.json({ error: 'Missing ip (send in body or ensure server receives x-forwarded-for/x-real-ip)' }, { status: 400 });
  }

  const { data: account, error: accountError } = await supabase
    .from('nlc_accounts')
    .select('user_id, last_login_ip, email, full_name')
    .single();

  if (accountError || !account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  const previousIp = (account.last_login_ip as string) || null;
  const isFirstLogin = previousIp === null;
  const isNewIp = previousIp !== null && previousIp !== ip;

  const meta = (user.user_metadata || {}) as Record<string, unknown>;
  const updatePayload: Record<string, unknown> = {
    last_login_ip: ip,
    last_login_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (meta.phone != null) updatePayload.phone = meta.phone;
  if (meta.birth_date != null) updatePayload.birth_date = meta.birth_date;
  if (meta.gender != null) updatePayload.gender = meta.gender;
  if (meta.address != null) updatePayload.address = meta.address;
  if (meta.city != null) updatePayload.city = meta.city;
  if (meta.ward != null) updatePayload.ward = meta.ward;
  if (meta.id_card != null) updatePayload.id_card = meta.id_card;
  if (meta.full_name != null) updatePayload.full_name = meta.full_name;

  const { error: updateErr } = await supabase
    .from('nlc_accounts')
    .update(updatePayload)
    .eq('user_id', account.user_id);

  if (updateErr) {
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }

  const toName = (account.full_name as string) || (account.email as string) || '';
  const toEmail = account.email as string;
  if (toEmail) {
    if (isFirstLogin) {
      try {
        await sendWelcome(toEmail, toName);
      } catch (e) {
        console.error('[register-login] Send welcome email error', e);
      }
    } else if (isNewIp) {
      try {
        await sendLoginNewIp(toEmail, toName, { ip, location: '' });
      } catch (e) {
        console.error('[register-login] Send login new IP email error', e);
      }
    }
  }

  return NextResponse.json({ success: true, newIpAlert: isNewIp }, { status: 200 });
}
