/**
 * QR Payment Component - Personal Bank Transfer
 * Generates QR code for Vietnamese bank transfers
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Upload, Check, X, Camera, AlertCircle, Copy, CheckCircle } from 'lucide-react';
import { FluidGlass } from '../ui/fluid-glass';
import { useAuth } from '../../contexts/UnifiedAuthContext';
import {
  createTransaction,
  uploadPaymentScreenshot,
  updateTransactionScreenshot,
} from '../../lib/payment/personal-payment-service';

interface QRPaymentProps {
  amount: number;
  productType: 'course' | 'product' | 'membership';
  productId: string;
  productName: string;
  onSuccess?: (transactionId: string) => void;
  onCancel?: () => void;
}

interface BankInfo {
  bankName: string;
  accountNumber: string;
  accountName: string;
  swiftCode?: string;
}

const BANK_INFO: BankInfo = {
  bankName: 'Vietcombank',
  accountNumber: '1234567890',
  accountName: 'NGUYEN VAN NAM LONG',
  swiftCode: 'BFTVVNVX',
};

export function QRPayment({
  amount,
  productType,
  productId,
  productName,
  onSuccess,
  onCancel,
}: QRPaymentProps) {
  const { userProfile } = useAuth();
  const [step, setStep] = useState<'qr' | 'upload' | 'pending' | 'success'>('qr');
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');

  // Generate QR code content (Vietnamese bank transfer format)
  useEffect(() => {
    const transferContent = `2|99|${BANK_INFO.accountNumber}|${BANK_INFO.accountName}|0|0|${amount}|${productName} - ${userProfile?.email || 'User'}`;

    // Generate QR code using API
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(transferContent)}`;
    setQrCodeUrl(qrUrl);
  }, [amount, productName, userProfile]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File quá lớn! Vui lòng chọn file nhỏ hơn 5MB');
        return;
      }

      setScreenshot(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshotPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitPayment = async () => {
    if (!screenshot || !userProfile?.id) return;

    setUploading(true);
    try {
      setStep('pending');

      // Step 1: Create transaction if not exists
      let txnId = transactionId;
      if (!txnId) {
        const transferContent = `2|99|${BANK_INFO.accountNumber}|${BANK_INFO.accountName}|0|0|${amount}|${productName} - ${userProfile.email}`;

        const newTransaction = await createTransaction({
          user_id: userProfile.id,
          amount,
          product_type: productType,
          product_id: productId,
          product_name: productName,
          qr_code_data: transferContent,
        });

        if (!newTransaction) {
          throw new Error('Failed to create transaction');
        }

        txnId = newTransaction.id;
        setTransactionId(txnId);
      }

      // Step 2: Upload screenshot
      const screenshotUrl = await uploadPaymentScreenshot(txnId, screenshot);
      if (!screenshotUrl) {
        throw new Error('Failed to upload screenshot');
      }

      // Step 3: Update transaction with screenshot URL
      const updated = await updateTransactionScreenshot(txnId, screenshotUrl);
      if (!updated) {
        throw new Error('Failed to update transaction');
      }

      // Success
      setStep('success');
      onSuccess?.(txnId);
    } catch (error) {
      console.error('Payment submission error:', error);
      alert('Có lỗi xảy ra! Vui lòng thử lại.');
      setStep('upload');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="w-full max-w-2xl"
      >
        <FluidGlass variant="dark" blur="xl" className="p-6 md:p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-white">Thanh toán chuyển khoản</h2>
              <p className="text-gray-400 text-sm mt-1">{productName}</p>
            </div>
            {onCancel && (
              <button
                onClick={onCancel}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            )}
          </div>

          {/* Amount Display */}
          <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl p-4 mb-6 border border-blue-500/30">
            <p className="text-gray-400 text-sm mb-1">Số tiền thanh toán</p>
            <p className="text-3xl font-bold text-white">
              {amount.toLocaleString('vi-VN')} VNĐ
            </p>
          </div>

          <AnimatePresence mode="wait">
            {step === 'qr' && (
              <motion.div
                key="qr"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {/* QR Code */}
                <div className="flex flex-col items-center mb-6">
                  <div className="bg-white p-6 rounded-2xl shadow-2xl mb-4">
                    <img
                      src={qrCodeUrl}
                      alt="QR Code"
                      className="w-64 h-64"
                    />
                  </div>
                  <p className="text-gray-400 text-sm text-center">
                    Quét mã QR để chuyển khoản qua ứng dụng ngân hàng
                  </p>
                </div>

                {/* Bank Information */}
                <div className="space-y-3 mb-6">
                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-400 text-sm">Ngân hàng</p>
                        <p className="text-white font-medium">{BANK_INFO.bankName}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(BANK_INFO.bankName, 'bank')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        {copied === 'bank' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Copy className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-400 text-sm">Số tài khoản</p>
                        <p className="text-white font-medium font-mono">{BANK_INFO.accountNumber}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(BANK_INFO.accountNumber, 'account')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        {copied === 'account' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Copy className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-400 text-sm">Tên tài khoản</p>
                        <p className="text-white font-medium">{BANK_INFO.accountName}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(BANK_INFO.accountName, 'name')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        {copied === 'name' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Copy className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/30">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-gray-400 text-sm">Nội dung chuyển khoản</p>
                        <p className="text-blue-400 font-medium">{productName} - {userProfile?.email}</p>
                      </div>
                      <button
                        onClick={() => copyToClipboard(`${productName} - ${userProfile?.email}`, 'content')}
                        className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        {copied === 'content' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <Copy className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 mb-6">
                  <div className="flex gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-300">
                      <p className="font-medium text-yellow-500 mb-2">Hướng dẫn:</p>
                      <ol className="list-decimal list-inside space-y-1">
                        <li>Quét mã QR hoặc chuyển khoản thủ công theo thông tin trên</li>
                        <li>Chụp ảnh màn hình sau khi chuyển khoản thành công</li>
                        <li>Tải ảnh lên để xác nhận thanh toán</li>
                        <li>Chờ admin xác nhận (thường trong vòng 2-24h)</li>
                      </ol>
                    </div>
                  </div>
                </div>

                {/* Next Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep('upload')}
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                >
                  <Upload className="h-5 w-5" />
                  Đã chuyển khoản, tải ảnh xác nhận
                </motion.button>
              </motion.div>
            )}

            {step === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p className="text-gray-400 mb-6 text-center">
                  Vui lòng tải lên ảnh chụp màn hình xác nhận chuyển khoản thành công
                </p>

                {/* Upload Area */}
                {!screenshotPreview ? (
                  <label className="block cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <div className="border-2 border-dashed border-gray-600 hover:border-blue-500 rounded-xl p-12 text-center transition-colors">
                      <Camera className="h-16 w-16 text-gray-500 mx-auto mb-4" />
                      <p className="text-white font-medium mb-2">Chọn ảnh từ thiết bị</p>
                      <p className="text-gray-400 text-sm">hoặc kéo thả ảnh vào đây</p>
                      <p className="text-gray-500 text-xs mt-2">PNG, JPG - Tối đa 5MB</p>
                    </div>
                  </label>
                ) : (
                  <div className="relative">
                    <img
                      src={screenshotPreview}
                      alt="Screenshot preview"
                      className="w-full rounded-xl"
                    />
                    <button
                      onClick={() => {
                        setScreenshot(null);
                        setScreenshotPreview(null);
                      }}
                      className="absolute top-4 right-4 p-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                    >
                      <X className="h-5 w-5 text-white" />
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep('qr')}
                    className="flex-1 py-3 border border-gray-600 hover:bg-white/5 text-white rounded-xl transition-colors"
                  >
                    Quay lại
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmitPayment}
                    disabled={!screenshot || uploading}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {uploading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                        Đang gửi...
                      </>
                    ) : (
                      <>
                        <Check className="h-5 w-5" />
                        Xác nhận thanh toán
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {step === 'pending' && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-20 h-20 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Đang xử lý...</h3>
                <p className="text-gray-400">Vui lòng đợi trong giây lát</p>
              </motion.div>
            )}

            {step === 'success' && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="h-12 w-12 text-green-500" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">Gửi thành công!</h3>
                <p className="text-gray-400 mb-4">
                  Yêu cầu thanh toán của bạn đã được gửi. Admin sẽ xác nhận trong vòng 2-24 giờ.
                </p>
                <p className="text-sm text-gray-500">
                  Mã giao dịch: <span className="font-mono text-blue-400">{transactionId}</span>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </FluidGlass>
      </motion.div>
    </div>
  );
}
