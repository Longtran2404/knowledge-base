/**
 * Payment Verification Page - Admin Dashboard
 * Manual verification of bank transfer payments
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Eye,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Users,
} from 'lucide-react';
import { FluidGlass } from '../../components/ui/fluid-glass';
import {
  getAllTransactions,
  getPendingTransactions,
  confirmTransaction,
  rejectTransaction,
  getTransactionStats,
  Transaction,
} from '../../lib/payment/personal-payment-service';
import { useAuth } from '../../contexts/UnifiedAuthContext';
import { Skeleton } from '../../components/ui/skeleton';

export default function PaymentVerificationPage() {
  const { userProfile } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [stats, setStats] = useState<any>(null);

  // Load transactions
  useEffect(() => {
    loadTransactions();
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const loadTransactions = async () => {
    setLoading(true);
    try {
      let data: Transaction[];
      if (filter === 'pending') {
        data = await getPendingTransactions();
      } else if (filter === 'all') {
        data = await getAllTransactions();
      } else {
        data = await getAllTransactions(filter);
      }
      setTransactions(data);
    } catch (error) {
      console.error('Load transactions error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const statsData = await getTransactionStats();
    setStats(statsData);
  };

  const handleConfirm = async (transactionId: string) => {
    if (!userProfile?.id) return;

    setActionLoading(true);
    try {
      const success = await confirmTransaction(transactionId, userProfile.id, adminNotes);
      if (success) {
        await loadTransactions();
        await loadStats();
        setSelectedTransaction(null);
        setAdminNotes('');
        alert('Xác nhận thanh toán thành công!');
      } else {
        alert('Có lỗi xảy ra! Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Confirm error:', error);
      alert('Có lỗi xảy ra! Vui lòng thử lại.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (transactionId: string) => {
    if (!userProfile?.id) return;
    if (!adminNotes.trim()) {
      alert('Vui lòng nhập lý do từ chối!');
      return;
    }

    setActionLoading(true);
    try {
      const success = await rejectTransaction(transactionId, userProfile.id, adminNotes);
      if (success) {
        await loadTransactions();
        await loadStats();
        setSelectedTransaction(null);
        setAdminNotes('');
        alert('Đã từ chối thanh toán!');
      } else {
        alert('Có lỗi xảy ra! Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Reject error:', error);
      alert('Có lỗi xảy ra! Vui lòng thử lại.');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(t =>
    t.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.user_full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'text-green-500 bg-green-500/20 border-green-500/30';
      case 'rejected':
        return 'text-red-500 bg-red-500/20 border-red-500/30';
      case 'pending':
      default:
        return 'text-yellow-500 bg-yellow-500/20 border-yellow-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'pending':
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Xác nhận thanh toán
          </h1>
          <p className="text-gray-400">Quản lý và xác nhận các giao dịch chuyển khoản</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <FluidGlass variant="dark" blur="md" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Tổng giao dịch</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-500" />
                </div>
              </div>
            </FluidGlass>

            <FluidGlass variant="dark" blur="md" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Chờ xác nhận</p>
                  <p className="text-2xl font-bold text-yellow-500">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-500" />
                </div>
              </div>
            </FluidGlass>

            <FluidGlass variant="dark" blur="md" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Đã xác nhận</p>
                  <p className="text-2xl font-bold text-green-500">{stats.confirmed}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-500" />
                </div>
              </div>
            </FluidGlass>

            <FluidGlass variant="dark" blur="md" className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Doanh thu</p>
                  <p className="text-2xl font-bold text-purple-500">
                    {(stats.confirmedAmount / 1000000).toFixed(1)}M
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-purple-500" />
                </div>
              </div>
            </FluidGlass>
          </div>
        )}

        {/* Filters and Search */}
        <FluidGlass variant="dark" blur="md" className="p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Filter Tabs */}
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'pending', label: 'Chờ xác nhận', count: stats?.pending || 0 },
                { value: 'all', label: 'Tất cả', count: stats?.total || 0 },
                { value: 'confirmed', label: 'Đã xác nhận', count: stats?.confirmed || 0 },
                { value: 'rejected', label: 'Đã từ chối', count: stats?.rejected || 0 },
              ].map(({ value, label, count }) => (
                <button
                  key={value}
                  onClick={() => setFilter(value as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === value
                      ? 'bg-blue-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm theo email, tên, sản phẩm..."
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>
          </div>
        </FluidGlass>

        {/* Transactions List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : filteredTransactions.length === 0 ? (
          <FluidGlass variant="dark" blur="md" className="p-12 text-center">
            <AlertCircle className="h-16 w-16 text-gray-500 mx-auto mb-4" />
            <p className="text-gray-400">Không có giao dịch nào</p>
          </FluidGlass>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map(transaction => (
              <FluidGlass key={transaction.id} variant="dark" blur="md" className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Transaction Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">
                          {transaction.product_name}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          Mã GD: <span className="font-mono text-blue-400">{transaction.id.slice(0, 8)}</span>
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center gap-2 ${getStatusColor(
                          transaction.status
                        )}`}
                      >
                        {getStatusIcon(transaction.status)}
                        {transaction.status === 'confirmed'
                          ? 'Đã xác nhận'
                          : transaction.status === 'rejected'
                          ? 'Đã từ chối'
                          : 'Chờ xác nhận'}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-gray-400 text-sm">Khách hàng</p>
                        <p className="text-white font-medium">{transaction.user_full_name || 'N/A'}</p>
                        <p className="text-gray-400 text-sm">{transaction.user_email}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-sm">Số tiền</p>
                        <p className="text-2xl font-bold text-green-500">
                          {transaction.amount.toLocaleString('vi-VN')} VNĐ
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>
                        Ngày tạo: {new Date(transaction.created_at).toLocaleDateString('vi-VN')}
                      </span>
                      {transaction.confirmed_at && (
                        <span>
                          Xác nhận: {new Date(transaction.confirmed_at).toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>

                    {transaction.admin_notes && (
                      <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                        <p className="text-sm text-gray-300">
                          <span className="text-yellow-500 font-medium">Ghi chú:</span>{' '}
                          {transaction.admin_notes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 md:w-48">
                    {transaction.payment_screenshot_url && (
                      <button
                        onClick={() => setSelectedTransaction(transaction)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                      >
                        <Eye className="h-4 w-4" />
                        Xem ảnh
                      </button>
                    )}

                    {transaction.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setAdminNotes('');
                          }}
                          className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Xác nhận
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTransaction(transaction);
                            setAdminNotes('');
                          }}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                          <XCircle className="h-4 w-4" />
                          Từ chối
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </FluidGlass>
            ))}
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      <AnimatePresence>
        {selectedTransaction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <FluidGlass variant="dark" blur="xl" className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-white">Chi tiết giao dịch</h3>
                  <button
                    onClick={() => {
                      setSelectedTransaction(null);
                      setAdminNotes('');
                    }}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <XCircle className="h-6 w-6 text-gray-400" />
                  </button>
                </div>

                {/* Screenshot */}
                {selectedTransaction.payment_screenshot_url && (
                  <div className="mb-6">
                    <img
                      src={selectedTransaction.payment_screenshot_url}
                      alt="Payment screenshot"
                      className="w-full rounded-lg"
                    />
                  </div>
                )}

                {/* Admin Actions */}
                {selectedTransaction.status === 'pending' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Ghi chú (tùy chọn)
                      </label>
                      <textarea
                        value={adminNotes}
                        onChange={e => setAdminNotes(e.target.value)}
                        placeholder="Nhập ghi chú..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none"
                        rows={3}
                      />
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleConfirm(selectedTransaction.id)}
                        disabled={actionLoading}
                        className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <CheckCircle className="h-5 w-5" />
                            Xác nhận thanh toán
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(selectedTransaction.id)}
                        disabled={actionLoading}
                        className="flex-1 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        ) : (
                          <>
                            <XCircle className="h-5 w-5" />
                            Từ chối thanh toán
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </FluidGlass>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
