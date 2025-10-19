import { useState } from "react";
import { motion } from "framer-motion";
import { Shield, Database, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabase-client";
import toast from "react-hot-toast";

export default function AdminSetupPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Array<{ step: string; status: 'success' | 'error'; message: string }>>([]);

  const runSetup = async () => {
    setLoading(true);
    setResults([]);
    const newResults: Array<{ step: string; status: 'success' | 'error'; message: string }> = [];

    try {
      // Step 1: Check if nlc_accounts exists
      newResults.push({ step: "Kiểm tra bảng nlc_accounts", status: 'success', message: "Đang kiểm tra..." });
      setResults([...newResults]);

      const { data: accounts, error: accountsError } = await (supabase as any)
        .from('nlc_accounts')
        .select('*')
        .limit(1);

      if (accountsError && accountsError.code === 'PGRST116') {
        // Table doesn't exist - need to create via SQL
        newResults[newResults.length - 1] = {
          step: "Kiểm tra bảng nlc_accounts",
          status: 'error',
          message: "Bảng chưa tồn tại - Cần chạy migration SQL"
        };
        setResults([...newResults]);

        // Provide SQL to run
        newResults.push({
          step: "Hướng dẫn tạo bảng",
          status: 'error',
          message: "Vui lòng chạy file: supabase/migrations/upgrade_admin_and_cms.sql trong Supabase SQL Editor"
        });
        setResults([...newResults]);
        setLoading(false);
        return;
      }

      newResults[newResults.length - 1] = {
        step: "Kiểm tra bảng nlc_accounts",
        status: 'success',
        message: "Bảng đã tồn tại ✓"
      };
      setResults([...newResults]);

      // Step 2: Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Không tìm thấy user đang đăng nhập");
      }

      newResults.push({
        step: "Lấy thông tin user",
        status: 'success',
        message: `User: ${user.email}`
      });
      setResults([...newResults]);

      // Step 3: Check if user exists in nlc_accounts
      const { data: existingAccount } = await (supabase as any)
        .from('nlc_accounts')
        .select('*')
        .eq('email', user.email)
        .single();

      if (existingAccount) {
        // Update existing account to admin
        newResults.push({
          step: "Cập nhật quyền admin",
          status: 'success',
          message: "Đang cập nhật..."
        });
        setResults([...newResults]);

        const { error: updateError } = await (supabase as any)
          .from('nlc_accounts')
          .update({
            account_role: 'admin',
            updated_at: new Date().toISOString()
          })
          .eq('email', user.email);

        if (updateError) throw updateError;

        newResults[newResults.length - 1] = {
          step: "Cập nhật quyền admin",
          status: 'success',
          message: `✓ Đã set ${user.email} thành ADMIN`
        };
        setResults([...newResults]);
      } else {
        // Insert new account as admin
        newResults.push({
          step: "Tạo tài khoản admin",
          status: 'success',
          message: "Đang tạo..."
        });
        setResults([...newResults]);

        const { error: insertError } = await (supabase as any)
          .from('nlc_accounts')
          .insert({
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || 'Admin',
            account_role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (insertError) throw insertError;

        newResults[newResults.length - 1] = {
          step: "Tạo tài khoản admin",
          status: 'success',
          message: `✓ Đã tạo ${user.email} với quyền ADMIN`
        };
        setResults([...newResults]);
      }

      // Step 4: Verify admin role
      newResults.push({
        step: "Xác nhận quyền admin",
        status: 'success',
        message: "Đang kiểm tra..."
      });
      setResults([...newResults]);

      const { data: verifyAccount } = await (supabase as any)
        .from('nlc_accounts')
        .select('*')
        .eq('email', user.email)
        .single();

      if (verifyAccount?.account_role === 'admin') {
        newResults[newResults.length - 1] = {
          step: "Xác nhận quyền admin",
          status: 'success',
          message: "✓ Xác nhận thành công - Bạn đã là ADMIN!"
        };
        setResults([...newResults]);

        toast.success("Setup hoàn tất! Vui lòng refresh trang (Ctrl + Shift + R)");
      } else {
        throw new Error("Xác nhận thất bại - Vui lòng thử lại");
      }

    } catch (err: any) {
      console.error("Setup error:", err);
      newResults.push({
        step: "Lỗi",
        status: 'error',
        message: err.message || "Có lỗi xảy ra"
      });
      setResults([...newResults]);
      toast.error("Setup thất bại - Xem chi tiết bên dưới");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 p-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 rounded-full bg-blue-500/20 border border-blue-500/30 mb-6">
            <Shield className="h-6 w-6 text-blue-400" />
            <span className="text-blue-300 font-semibold">Admin Setup</span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-4">
            Thiết lập tài khoản Admin
          </h1>
          <p className="text-slate-400 text-lg">
            Tự động cấu hình database và set quyền admin cho tài khoản của bạn
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-8 mb-6"
        >
          <div className="flex items-start gap-4 mb-6">
            <Database className="h-8 w-8 text-blue-400 flex-shrink-0 mt-1" />
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Quy trình Setup</h2>
              <div className="space-y-2 text-slate-300">
                <p>✓ Kiểm tra database tables</p>
                <p>✓ Lấy thông tin tài khoản hiện tại</p>
                <p>✓ Set quyền admin cho tài khoản</p>
                <p>✓ Xác nhận và kích hoạt</p>
              </div>
            </div>
          </div>

          <button
            onClick={runSetup}
            disabled={loading}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:from-blue-500 hover:to-purple-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                Chạy Setup Admin
              </>
            )}
          </button>
        </motion.div>

        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-800 p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Kết quả:</h3>
            <div className="space-y-3">
              {results.map((result, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex items-start gap-3 p-4 rounded-lg ${
                    result.status === 'success'
                      ? 'bg-green-500/10 border border-green-500/30'
                      : 'bg-red-500/10 border border-red-500/30'
                  }`}
                >
                  {result.status === 'success' ? (
                    <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className={`font-semibold ${
                      result.status === 'success' ? 'text-green-300' : 'text-red-300'
                    }`}>
                      {result.step}
                    </div>
                    <div className={`text-sm ${
                      result.status === 'success' ? 'text-green-400/80' : 'text-red-400/80'
                    }`}>
                      {result.message}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-200">
              <strong>Lưu ý:</strong> Nếu setup thất bại do "Bảng chưa tồn tại", bạn cần chạy migrations SQL thủ công:
              <ol className="list-decimal list-inside mt-2 space-y-1 text-amber-300/90">
                <li>Mở Supabase Dashboard → SQL Editor</li>
                <li>Chạy file: <code className="px-2 py-0.5 bg-slate-900/50 rounded">supabase/migrations/upgrade_admin_and_cms.sql</code></li>
                <li>Chạy file: <code className="px-2 py-0.5 bg-slate-900/50 rounded">supabase/migrations/add_subscription_system.sql</code></li>
                <li>Quay lại đây và chạy Setup lại</li>
              </ol>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
