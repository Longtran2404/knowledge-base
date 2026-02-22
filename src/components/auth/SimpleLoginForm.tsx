import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { ROUTES } from '../../config/routes';
import { z } from 'zod';
import { supabase } from '../../lib/supabase-client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { VIETNAM_PROVINCES } from '../../data/vietnam-provinces';
import {
  fetchDistrictsByProvince,
  fetchWardsByDistrict,
  type DistrictOption,
  type WardOption,
} from '../../lib/vietnam-address-api';

const emailSchema = z.string().email('Email không hợp lệ');
const passwordSchema = z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự');
const fullNameSchema = z.string().min(1, 'Họ tên không được để trống');
// SĐT Việt Nam 10 số: 03, 05, 07, 08, 09
const phoneSchema = z.string().regex(/^0(3[2-9]|5[6-9]|7[0-9]|8[1-9]|9[0-9])\d{7}$/, 'Số điện thoại 10 số, bắt đầu 03/05/07/08/09').optional().or(z.literal(''));
// CCCD 12 chữ số (định dạng mới)
const idCardSchema = z.string().regex(/^\d{12}$/, 'CCCD đúng 12 chữ số').optional().or(z.literal(''));
// Ngày sinh: yyyy-mm-dd (input type="date") hoặc dd/mm/yyyy
const dateSchema = z
  .union([
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    z.string().regex(/^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/),
  ])
  .optional()
  .or(z.literal(''));

const ALLOWED_RETURN_PATHS = ['/goi-dich-vu', '/thanh-cong', '/hop-tac', '/'];

function getRedirectPath(returnUrl: string | null, plan: string | null): string {
  if (!returnUrl || !returnUrl.startsWith('/')) return '/';
  const path = returnUrl.split('?')[0];
  if (!ALLOWED_RETURN_PATHS.some((p) => path === p || (p !== '/' && path.startsWith(p)))) return '/';
  if (plan && (plan === 'premium' || plan === 'partner' || plan === 'free')) {
    return returnUrl.includes('?') ? `${returnUrl}&plan=${plan}` : `${returnUrl}?plan=${plan}`;
  }
  return returnUrl;
}

/** Chuyển ngày sinh sang yyyy-mm-dd cho DB (nhận dd/mm/yyyy hoặc yyyy-mm-dd). */
function birthDateToIso(d: string): string | null {
  const t = d.trim();
  if (!t) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(t)) return t;
  if (/^(0[1-9]|[12]\d|3[01])\/(0[1-9]|1[0-2])\/(19|20)\d{2}$/.test(t)) {
    const [dd, mm, yyyy] = t.split('/');
    return `${yyyy}-${mm}-${dd}`;
  }
  return null;
}

/** Chống inspect: tắt context menu, F12, Ctrl+Shift+I/J/C, devtools */
function useDisableInspect() {
  useEffect(() => {
    const prevent = (e: MouseEvent | KeyboardEvent) => {
      e.preventDefault();
      e.stopPropagation();
    };
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F12') {
        e.preventDefault();
        return false;
      }
      if (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key.toUpperCase())) {
        e.preventDefault();
        return false;
      }
    };
    document.addEventListener('contextmenu', onContextMenu);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('contextmenu', onContextMenu);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);
}

const inputBase =
  'w-full px-4 py-2.5 bg-slate-800/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500';
const inputError = 'border-red-500';
const inputOk = 'border-slate-700';

export default function SimpleLoginForm() {
  const [searchParams] = useSearchParams();
  const returnUrl = searchParams.get('returnUrl');
  const plan = searchParams.get('plan');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'' | 'nam' | 'nu' | 'khac'>('');
  const [idCard, setIdCard] = useState('');
  const [houseNumber, setHouseNumber] = useState('');
  const [streetName, setStreetName] = useState('');
  const [ward, setWard] = useState('');
  const [provinceCode, setProvinceCode] = useState('');
  const [districts, setDistricts] = useState<DistrictOption[]>([]);
  const [districtCode, setDistrictCode] = useState<number | ''>('');
  const [wards, setWards] = useState<WardOption[]>([]);
  const [wardCode, setWardCode] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'login';
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [emailVerifiedSuccess, setEmailVerifiedSuccess] = useState(false);
  const navigate = useNavigate();

  useDisableInspect();

  useEffect(() => {
    if (searchParams.get('mode') === 'signup') setMode('signup');
  }, [searchParams]);

  useEffect(() => {
    const hash = typeof window !== 'undefined' ? window.location.hash : '';
    const params = hash ? new URLSearchParams(hash.slice(1)) : null;
    const type = params?.get('type');
    const verified = searchParams.get('verified');
    if (type === 'signup' || type === 'recovery' || verified === '1') {
      setEmailVerifiedSuccess(true);
      if (hash && typeof window !== 'undefined') {
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (!emailVerifiedSuccess) return;
    const t = setTimeout(() => {
      navigate(getRedirectPath(returnUrl, plan));
    }, 4000);
    return () => clearTimeout(t);
  }, [emailVerifiedSuccess, navigate, returnUrl, plan]);

  const selectedProvince = VIETNAM_PROVINCES.find((p) => p.code === provinceCode);
  const provinceName = selectedProvince ? selectedProvince.name : '';

  useEffect(() => {
    if (!provinceName) {
      setDistricts([]);
      setDistrictCode('');
      setWards([]);
      setWardCode('');
      setWard('');
      return;
    }
    setDistrictCode('');
    setWards([]);
    setWardCode('');
    setWard('');
    setLoadingDistricts(true);
    fetchDistrictsByProvince(provinceName).then((list) => {
      setDistricts(list);
      setLoadingDistricts(false);
    });
  }, [provinceCode, provinceName]);

  useEffect(() => {
    if (!districtCode) {
      setWards([]);
      setWardCode('');
      setWard('');
      return;
    }
    setWardCode('');
    setWard('');
    setLoadingWards(true);
    fetchWardsByDistrict(Number(districtCode)).then((list) => {
      setWards(list);
      setLoadingWards(false);
    });
  }, [districtCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const emailResult = emailSchema.safeParse(email);
    const passwordResult = passwordSchema.safeParse(password);
    const newErrors: Record<string, string> = {};
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0]?.message ?? 'Email không hợp lệ';
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0]?.message ?? 'Mật khẩu phải có ít nhất 6 ký tự';

    if (mode === 'signup') {
      const nameResult = fullNameSchema.safeParse(fullName.trim());
      if (!nameResult.success) newErrors.fullName = nameResult.error.errors[0]?.message ?? 'Họ tên không được để trống';
      if (phone.trim()) {
        const p = phoneSchema.safeParse(phone.trim().replace(/\s/g, ''));
        if (!p.success) newErrors.phone = 'Số điện thoại 10 số, bắt đầu 03/05/07/08/09';
      }
      if (birthDate.trim()) {
        const d = dateSchema.safeParse(birthDate.trim());
        if (!d.success) newErrors.birthDate = 'Chọn ngày sinh hợp lệ (hoặc dd/mm/yyyy)';
      }
      if (idCard.trim()) {
        const c = idCardSchema.safeParse(idCard.trim().replace(/\D/g, ''));
        if (!c.success) newErrors.idCard = 'CCCD đúng 12 chữ số';
      }
      if (password !== passwordConfirm) {
        newErrors.passwordConfirm = 'Mật khẩu nhập lại không khớp';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          if (/email not confirmed/i.test(error.message)) {
            const params = new URLSearchParams({ unverified: '1' });
            if (email?.trim()) params.set('email', email.trim());
            navigate(`/gui-lai-xac-minh?${params.toString()}`, { state: { email: email?.trim() }, replace: true });
            setLoading(false);
            return;
          }
          const authMsg =
            /invalid login credentials|invalid email or password|invalid_credentials/i.test(error.message)
              ? 'Không tìm thấy tài khoản hoặc nhập sai email/mật khẩu. Vui lòng kiểm tra lại.'
              : error.message;
          throw new Error(authMsg);
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          const regRes = await fetch('/api/register-login', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${session.access_token}`,
            },
            body: JSON.stringify({}),
          });
          if (regRes.status === 404) {
            await supabase.auth.signOut();
            toast.error('Tài khoản chưa đăng ký. Vui lòng đăng ký trước.');
            setErrors((prev) => ({ ...prev, submit: 'Tài khoản chưa đăng ký. Vui lòng đăng ký trước.' }));
            setLoading(false);
            return;
          }
        }
        toast.success('Đăng nhập thành công!');
        const target = getRedirectPath(returnUrl, plan);
        navigate(target);
      } else {
        const name = (fullName || email.split('@')[0]).trim();
        const birthIso = birthDateToIso(birthDate);
        const addressParts = [houseNumber.trim(), streetName.trim()].filter(Boolean);
        const addressLine = addressParts.length ? addressParts.join(', ') : '';

        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name,
              phone: phone.trim() || undefined,
              birth_date: birthIso || undefined,
              gender: gender || undefined,
              id_card: idCard.trim().replace(/\D/g, '') || undefined,
              address: addressLine || undefined,
              city: provinceName || undefined,
              ward: ward.trim() || undefined,
            },
            emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/dang-nhap` : undefined,
          },
        });

        if (error) throw error;

        navigate('/cho-xac-minh-email', { state: { email: email.trim() }, replace: true });
      }
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string; details?: string; status?: number };
      const rawMsg = err?.message ?? (error instanceof Error ? error.message : 'Có lỗi xảy ra');
      const code = err?.code ?? (error as { code?: string }).code;
      const status = err?.status;
      const name = error instanceof Error ? error.name : undefined;
      // Log object thuần (Supabase AuthApiError không serialize tốt nên không log nguyên error)
      if (typeof console !== 'undefined' && console.error) {
        console.error('[Auth form error]', { message: rawMsg, code, status, name });
      }
      // Hiển thị rõ hơn: nếu message chung chung (database error saving new user) thì thêm gợi ý và code
      const isGenericDbError = /database error saving new user|database operation failed/i.test(rawMsg);
      const msg = isGenericDbError && code
        ? `${rawMsg} (${code}). Kiểm tra cấu hình database và trigger nlc_accounts.`
        : isGenericDbError
          ? `${rawMsg} Kiểm tra kết nối và cấu hình database (bảng nlc_accounts, trigger trên auth.users).`
          : rawMsg;
      toast.error(msg);
      const isEmailTaken =
        mode === 'signup' &&
        /already registered|already exists|email.*taken|user already registered/i.test(rawMsg);
      setErrors((prev) => ({
        ...prev,
        submit: msg,
        ...(isEmailTaken ? { email: 'Email này đã được đăng ký. Dùng email khác hoặc đăng nhập.' } : {}),
      }));
      try {
        await (supabase as any).from('nlc_auth_errors').insert({
          email: mode === 'login' ? email : undefined,
          error_message: rawMsg,
          error_code: code,
          ip_or_origin: typeof window !== 'undefined' ? window.location.origin : undefined,
        });
      } catch (_) { /* ignore */ }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4 select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl px-2 sm:px-0"
      >
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl">
          {emailVerifiedSuccess && (
            <div className="mb-6 p-4 rounded-lg bg-green-900/40 border border-green-600/50 text-green-200 text-center" role="alert">
              <p className="font-medium">Email đã xác thực. Tài khoản của bạn đã sẵn sàng.</p>
              <p className="text-sm mt-1">Đang chuyển hướng...</p>
            </div>
          )}
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </h1>
            <p className="text-slate-400 text-sm">Knowledge Base</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {mode === 'login' ? (
              <>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined, submit: undefined })); }}
                    className={`${inputBase} ${errors.email ? inputError : inputOk}`}
                    placeholder="email@example.com"
                    aria-invalid={!!errors.email}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-400" role="alert">{errors.email}</p>}
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">Mật khẩu</label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined, submit: undefined })); }}
                      className={`${inputBase} pr-10 ${errors.password ? inputError : inputOk}`}
                      placeholder="••••••••"
                      aria-invalid={!!errors.password}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                      tabIndex={-1}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-sm text-red-400" role="alert">{errors.password}</p>}
                  <p className="mt-1 text-sm">
                    <Link to={ROUTES.QUEN_MAT_KHAU} className="text-primary hover:underline font-medium">Quên mật khẩu?</Link>
                  </p>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setErrors((p) => ({ ...p, email: undefined, submit: undefined })); }}
                      className={`${inputBase} ${errors.email ? inputError : inputOk}`}
                      placeholder="email@example.com"
                    />
                    {errors.email && <p className="mt-1 text-sm text-red-400">{errors.email}</p>}
                  </div>
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-slate-300 mb-1">Họ tên</label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => { setFullName(e.target.value); setErrors((p) => ({ ...p, fullName: undefined })); }}
                      className={`${inputBase} ${errors.fullName ? inputError : inputOk}`}
                      placeholder="Nguyễn Văn A"
                    />
                    {errors.fullName && <p className="mt-1 text-sm text-red-400">{errors.fullName}</p>}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1">Số điện thoại</label>
                    <input
                      id="phone"
                      type="tel"
                      inputMode="numeric"
                      value={phone}
                      onChange={(e) => { setPhone(e.target.value.replace(/\D/g, '').slice(0, 10)); setErrors((p) => ({ ...p, phone: undefined })); }}
                      className={`${inputBase} ${errors.phone ? inputError : inputOk}`}
                      placeholder="0912345678"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-400">{errors.phone}</p>}
                  </div>
                  <div>
                    <label htmlFor="birthDate" className="block text-sm font-medium text-slate-300 mb-1">Ngày sinh</label>
                    <input
                      id="birthDate"
                      type="date"
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className={`${inputBase} ${errors.birthDate ? inputError : inputOk}`}
                      max={new Date().toISOString().slice(0, 10)}
                    />
                    {errors.birthDate && <p className="mt-1 text-sm text-red-400">{errors.birthDate}</p>}
                  </div>
                  <div>
                    <label htmlFor="gender" className="block text-sm font-medium text-slate-300 mb-1">Giới tính</label>
                    <select
                      id="gender"
                      value={gender}
                      onChange={(e) => setGender((e.target.value || '') as '' | 'nam' | 'nu' | 'khac')}
                      className={inputBase + ' ' + inputOk + ' cursor-pointer'}
                    >
                      <option value="">-- Chọn giới tính --</option>
                      <option value="nam">Nam</option>
                      <option value="nu">Nữ</option>
                      <option value="khac">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="idCard" className="block text-sm font-medium text-slate-300 mb-1">CCCD (12 số)</label>
                    <input
                      id="idCard"
                      type="text"
                      inputMode="numeric"
                      value={idCard}
                      onChange={(e) => { setIdCard(e.target.value.replace(/\D/g, '').slice(0, 12)); setErrors((p) => ({ ...p, idCard: undefined })); }}
                      className={`${inputBase} ${errors.idCard ? inputError : inputOk}`}
                      placeholder="001234567890"
                      maxLength={12}
                    />
                    {errors.idCard && <p className="mt-1 text-sm text-red-400">{errors.idCard}</p>}
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="houseNumber" className="block text-sm font-medium text-slate-300 mb-1">Số nhà</label>
                    <input
                      id="houseNumber"
                      type="text"
                      value={houseNumber}
                      onChange={(e) => setHouseNumber(e.target.value)}
                      className={inputBase + ' ' + inputOk}
                      placeholder="123"
                    />
                  </div>
                  <div>
                    <label htmlFor="streetName" className="block text-sm font-medium text-slate-300 mb-1">Tên đường</label>
                    <input
                      id="streetName"
                      type="text"
                      value={streetName}
                      onChange={(e) => setStreetName(e.target.value)}
                      className={inputBase + ' ' + inputOk}
                      placeholder="Nguyễn Huệ"
                    />
                  </div>
                  <div>
                    <label htmlFor="province" className="block text-sm font-medium text-slate-300 mb-1">Tỉnh / Thành phố</label>
                    <select
                      id="province"
                      value={provinceCode}
                      onChange={(e) => setProvinceCode(e.target.value)}
                      className={inputBase + ' ' + inputOk + ' cursor-pointer'}
                    >
                      <option value="">-- Chọn tỉnh/thành phố --</option>
                      {VIETNAM_PROVINCES.map((p) => (
                        <option key={p.code} value={p.code}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="district" className="block text-sm font-medium text-slate-300 mb-1">Quận / Huyện / Thị xã</label>
                    <select
                      id="district"
                      value={districtCode === '' ? '' : String(districtCode)}
                      onChange={(e) => setDistrictCode(e.target.value ? Number(e.target.value) : '')}
                      disabled={!provinceName || loadingDistricts}
                      className={inputBase + ' ' + inputOk + ' cursor-pointer disabled:opacity-60'}
                    >
                      <option value="">
                        {loadingDistricts ? '-- Đang tải quận/huyện --' : '-- Chọn quận/huyện --'}
                      </option>
                      {districts.map((d) => (
                        <option key={d.code} value={d.code}>{d.name}</option>
                      ))}
                    </select>
                    {!loadingDistricts && provinceName && districts.length === 0 && (
                      <p className="mt-1 text-sm text-amber-400">Không tải được. Thử lại hoặc chọn lại tỉnh.</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="ward" className="block text-sm font-medium text-slate-300 mb-1">Phường / Xã / Thị trấn</label>
                    <select
                      id="ward"
                      value={wardCode === '' ? '' : String(wardCode)}
                      onChange={(e) => {
                        const code = e.target.value ? Number(e.target.value) : '';
                        setWardCode(code);
                        const w = wards.find((x) => x.code === code);
                        setWard(w ? w.name : '');
                      }}
                      disabled={!districtCode || loadingWards}
                      className={inputBase + ' ' + inputOk + ' cursor-pointer disabled:opacity-60'}
                    >
                      <option value="">
                        {loadingWards ? '-- Đang tải phường/xã --' : '-- Chọn phường/xã/thị trấn --'}
                      </option>
                      {wards.map((w) => (
                        <option key={w.code} value={w.code}>{w.name}</option>
                      ))}
                    </select>
                    {!loadingWards && districtCode && wards.length === 0 && (
                      <p className="mt-1 text-sm text-amber-400">Không tải được. Thử lại hoặc chọn lại quận.</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">Mật khẩu</label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined, passwordConfirm: undefined, submit: undefined })); }}
                        className={`${inputBase} pr-10 ${errors.password ? inputError : inputOk}`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                        tabIndex={-1}
                        aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-400">{errors.password}</p>}
                  </div>
                  <div>
                    <label htmlFor="passwordConfirm" className="block text-sm font-medium text-slate-300 mb-1">Nhập lại mật khẩu</label>
                    <input
                      id="passwordConfirm"
                      type={showPassword ? 'text' : 'password'}
                      value={passwordConfirm}
                      onChange={(e) => { setPasswordConfirm(e.target.value); setErrors((p) => ({ ...p, passwordConfirm: undefined })); }}
                      className={`${inputBase} ${errors.passwordConfirm ? inputError : inputOk}`}
                      placeholder="••••••••"
                    />
                    {errors.passwordConfirm && <p className="mt-1 text-sm text-red-400">{errors.passwordConfirm}</p>}
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              aria-busy={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin shrink-0" aria-hidden />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <span>{mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</span>
              )}
            </button>
            {loading && (
              <p className="text-center text-sm text-slate-400" role="status">
                {mode === 'login' ? 'Đang kiểm tra đăng nhập...' : 'Đang tạo tài khoản...'}
              </p>
            )}
            {errors.submit && !loading && (
              <p className="text-center text-sm text-red-400 mt-1" role="alert">
                {errors.submit}
              </p>
            )}
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setErrors({}); }}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              {mode === 'login' ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
