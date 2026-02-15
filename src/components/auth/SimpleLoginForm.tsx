import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { supabase } from '../../lib/supabase-client';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const emailSchema = z.string().email('Email không hợp lệ');
const passwordSchema = z.string().min(6, 'Mật khẩu phải có ít nhất 6 ký tự');

export default function SimpleLoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const emailResult = emailSchema.safeParse(email);
    const passwordResult = passwordSchema.safeParse(password);

    const newErrors: { email?: string; password?: string } = {};
    if (!emailResult.success) newErrors.email = emailResult.error.errors[0]?.message ?? 'Email không hợp lệ';
    if (!passwordResult.success) newErrors.password = passwordResult.error.errors[0]?.message ?? 'Mật khẩu phải có ít nhất 6 ký tự';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        toast.success('Đăng nhập thành công!');
        navigate('/');
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: email.split('@')[0],
            }
          }
        });

        if (error) throw error;

        toast.success('Đăng ký thành công! Vui lòng kiểm tra email để xác nhận.');
        setMode('login');
      }
    } catch (error: unknown) {
      console.error('Auth error:', error);
      const msg = error instanceof Error ? error.message : 'Có lỗi xảy ra';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-8 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </h1>
            <p className="text-slate-400">
              Knowledge Base
            </p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setErrors((prev) => ({ ...prev, email: undefined })); }}
                className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.email ? 'border-red-500' : 'border-slate-700'}`}
                placeholder="email@example.com"
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? 'email-error' : undefined}
              />
              {errors.email && (
                <p id="email-error" className="mt-1 text-sm text-red-400" role="alert">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrors((prev) => ({ ...prev, password: undefined })); }}
                className={`w-full px-4 py-3 bg-slate-800/50 border rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.password ? 'border-red-500' : 'border-slate-700'}`}
                placeholder="••••••••"
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && (
                <p id="password-error" className="mt-1 text-sm text-red-400" role="alert">{errors.password}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Đang xử lý...' : mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
              className="text-blue-400 hover:text-blue-300 text-sm"
            >
              {mode === 'login'
                ? 'Chưa có tài khoản? Đăng ký'
                : 'Đã có tài khoản? Đăng nhập'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
