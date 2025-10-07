/**
 * QR Code Payment Component
 * Hiển thị QR code cho thanh toán chuyển khoản ngân hàng
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  QrCode,
  Copy,
  Check,
  RefreshCw,
  Clock,
  AlertCircle,
  CreditCard,
  Building2,
  Phone
} from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

interface BankAccount {
  bankName: string;
  bankCode: string;
  accountNumber: string;
  accountName: string;
  qrCodeUrl?: string;
  color: string;
}

interface QRCodePaymentProps {
  amount: number;
  orderInfo: string;
  transactionId: string;
  onPaymentConfirm: (paymentData: any) => void;
  onCancel: () => void;
}

const bankAccounts: BankAccount[] = [
  {
    bankName: 'Vietcombank',
    bankCode: 'VCB',
    accountNumber: '1234567890',
    accountName: 'CONG TY NAM LONG CENTER',
    color: 'bg-green-600'
  },
  {
    bankName: 'Techcombank',
    bankCode: 'TCB',
    accountNumber: '9876543210',
    accountName: 'CONG TY NAM LONG CENTER',
    color: 'bg-blue-600'
  },
  {
    bankName: 'BIDV',
    bankCode: 'BIDV',
    accountNumber: '5555666677',
    accountName: 'CONG TY NAM LONG CENTER',
    color: 'bg-yellow-600'
  }
];

export const QRCodePayment: React.FC<QRCodePaymentProps> = ({
  amount,
  orderInfo,
  transactionId,
  onPaymentConfirm,
  onCancel
}) => {
  const [selectedBank, setSelectedBank] = useState<BankAccount>(bankAccounts[0]);
  const [copiedField, setCopiedField] = useState<string>('');
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0 && !paymentConfirmed) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, paymentConfirmed]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const getQRCodeImage = (bank: BankAccount) => {
    // Use predefined QR code images for each bank
    const qrImages = {
      'VCB': '/assets/qr-codes/vietcombank-qr.jpg',
      'TCB': '/assets/qr-codes/techcombank-qr.jpg',
      'BIDV': '/assets/qr-codes/bidv-qr.jpg'
    };

    // Fallback to provided QR image
    return qrImages[bank.bankCode as keyof typeof qrImages] || '/assets/qr-codes/default-qr.jpg';
  };

  const handleConfirmPayment = () => {
    setPaymentConfirmed(true);
    const paymentData = {
      transactionId,
      method: 'bank_transfer',
      bank: selectedBank,
      amount,
      timestamp: new Date().toISOString()
    };
    onPaymentConfirm(paymentData);
  };

  const refreshQRCode = () => {
    setTimeLeft(900); // Reset timer
    // In real implementation, you might generate a new transaction ID
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Thanh toán bằng chuyển khoản</h2>
        <p className="text-gray-600">
          Chuyển khoản chính xác theo thông tin bên dưới và xác nhận thanh toán
        </p>

        {timeLeft > 0 && !paymentConfirmed && (
          <div className="flex items-center justify-center space-x-2 text-orange-600">
            <Clock className="h-4 w-4" />
            <span className="font-medium">Thời gian còn lại: {formatTime(timeLeft)}</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bank Selection & QR Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <QrCode className="h-5 w-5" />
              <span>Quét mã QR để thanh toán</span>
            </CardTitle>
            <CardDescription>
              Chọn ngân hàng và quét mã QR bằng app ngân hàng
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Bank Selection */}
            <div className="space-y-2">
              <Label>Chọn ngân hàng</Label>
              <div className="grid grid-cols-1 gap-2">
                {bankAccounts.map((bank) => (
                  <Button
                    key={bank.bankCode}
                    variant={selectedBank.bankCode === bank.bankCode ? "default" : "outline"}
                    className="justify-start h-auto p-3"
                    onClick={() => setSelectedBank(bank)}
                  >
                    <div className={`w-4 h-4 rounded ${bank.color} mr-3`}></div>
                    <div className="text-left">
                      <div className="font-medium">{bank.bankName}</div>
                      <div className="text-sm opacity-70">{bank.accountNumber}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            {/* QR Code */}
            <div className="text-center space-y-4">
              <div className="inline-block p-4 bg-white border border-gray-200 rounded-lg">
                <img
                  src={getQRCodeImage(selectedBank)}
                  alt="QR Code"
                  className="w-48 h-48 mx-auto"
                />
              </div>

              <div className="space-y-2">
                <Badge variant="secondary" className="bg-blue-50 text-blue-700">
                  Quét bằng app {selectedBank.bankName}
                </Badge>
                <p className="text-sm text-gray-600">
                  Mở app ngân hàng → Quét QR → Xác nhận thanh toán
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={refreshQRCode}
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Làm mới mã QR
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Payment Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Thông tin chuyển khoản</span>
            </CardTitle>
            <CardDescription>
              Thông tin chi tiết để chuyển khoản thủ công
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <Label className="text-sm font-medium">Ngân hàng</Label>
                    <div className="font-medium">{selectedBank.bankName}</div>
                  </div>
                  <div className={`w-6 h-6 rounded ${selectedBank.color}`}></div>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Số tài khoản</Label>
                    <div className="font-mono text-lg">{selectedBank.accountNumber}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(selectedBank.accountNumber, 'account')}
                  >
                    {copiedField === 'account' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Chủ tài khoản</Label>
                    <div className="font-medium">{selectedBank.accountName}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(selectedBank.accountName, 'name')}
                  >
                    {copiedField === 'name' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex-1">
                    <Label className="text-sm font-medium text-blue-700">Số tiền</Label>
                    <div className="font-bold text-xl text-blue-900">{formatPrice(amount)}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(amount.toString(), 'amount')}
                  >
                    {copiedField === 'amount' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Nội dung chuyển khoản</Label>
                    <div className="font-mono text-sm">{transactionId}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(transactionId, 'content')}
                  >
                    {copiedField === 'content' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-2">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-yellow-700">
                    <strong>Lưu ý quan trọng:</strong>
                    <ul className="mt-1 space-y-1 list-disc list-inside">
                      <li>Chuyển khoản đúng số tiền và nội dung</li>
                      <li>Sau khi chuyển khoản, nhấn "Tôi đã thanh toán"</li>
                      <li>Giao dịch sẽ được xác nhận trong 1-3 phút</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Button
                  onClick={handleConfirmPayment}
                  className="w-full"
                  disabled={paymentConfirmed || timeLeft <= 0}
                >
                  {paymentConfirmed ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Đã xác nhận thanh toán
                    </>
                  ) : (
                    'Tôi đã thanh toán'
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="w-full"
                  disabled={paymentConfirmed}
                >
                  Hủy thanh toán
                </Button>
              </div>

              {paymentConfirmed && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-green-50 border border-green-200 rounded-lg p-4"
                >
                  <div className="flex items-center space-x-2 text-green-700">
                    <Check className="h-5 w-5" />
                    <span className="font-medium">
                      Đã nhận được xác nhận! Chúng tôi sẽ kiểm tra và kích hoạt tài khoản trong ít phút.
                    </span>
                  </div>
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Phone className="h-5 w-5" />
            <span>Cần hỗ trợ?</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <div className="font-medium">Hotline</div>
              <div className="text-blue-600">1900 xxxx</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">Email</div>
              <div className="text-blue-600">support@namlongcenter.com</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">Chat</div>
              <div className="text-blue-600">Hỗ trợ trực tuyến 24/7</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRCodePayment;