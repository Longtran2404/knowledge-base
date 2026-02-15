/**
 * Trang thanh toán SePay - Form test với callback success/error/cancel
 * Doc: https://developer.sepay.vn/vi/cong-thanh-toan/bat-dau
 */

import React, { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SePayCheckoutForm } from '../components/payment/SePayCheckoutForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { CheckCircle, XCircle, Ban, QrCode } from 'lucide-react';
import { SEO } from '../components/SEO';

const DEFAULT_INVOICE = `INV-${Date.now()}`;
const DEFAULT_AMOUNT = 100000;
const DEFAULT_DESCRIPTION = 'Thanh toán test SePay';

export default function SePayPaymentPage() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get('status');
  const invoice = searchParams.get('invoice') || '';

  const [orderInvoiceNumber, setOrderInvoiceNumber] = useState(DEFAULT_INVOICE);
  const [orderAmount, setOrderAmount] = useState(DEFAULT_AMOUNT);
  const [orderDescription, setOrderDescription] = useState(DEFAULT_DESCRIPTION);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const basePath = '/thanh-toan-sepay';
  const successUrl = useMemo(
    () => `${origin}${basePath}?status=success&invoice=${encodeURIComponent(orderInvoiceNumber)}`,
    [origin, orderInvoiceNumber]
  );
  const errorUrl = useMemo(() => `${origin}${basePath}?status=error`, [origin]);
  const cancelUrl = useMemo(() => `${origin}${basePath}?status=cancel`, [origin]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Thanh toán SePay"
        description="Thanh toán qua SePay - Quét mã QR chuyển khoản ngân hàng"
        url="/thanh-toan-sepay"
      />
      <div className="container max-w-lg mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="h-6 w-6" />
              Thanh toán SePay (QR chuyển khoản)
            </CardTitle>
            <CardDescription>
              Nhập thông tin đơn hàng và bấm thanh toán để chuyển đến cổng SePay.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {status === 'success' && (
              <Alert className="border-green-200 bg-green-50 dark:bg-green-950/30 dark:border-green-800">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Thanh toán thành công</AlertTitle>
                <AlertDescription>
                  Đơn hàng của bạn đã được thanh toán. {invoice && `Mã đơn: ${invoice}`}
                </AlertDescription>
              </Alert>
            )}
            {status === 'error' && (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Thanh toán thất bại</AlertTitle>
                <AlertDescription>Giao dịch không thành công. Vui lòng thử lại.</AlertDescription>
              </Alert>
            )}
            {status === 'cancel' && (
              <Alert className="border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
                <Ban className="h-4 w-4 text-amber-600" />
                <AlertTitle>Đã hủy</AlertTitle>
                <AlertDescription>Bạn đã hủy thanh toán.</AlertDescription>
              </Alert>
            )}

            <div className="grid gap-4">
              <div>
                <Label htmlFor="invoice">Mã đơn hàng</Label>
                <Input
                  id="invoice"
                  value={orderInvoiceNumber}
                  onChange={(e) => setOrderInvoiceNumber(e.target.value)}
                  placeholder="INV-xxx"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="amount">Số tiền (VND)</Label>
                <Input
                  id="amount"
                  type="number"
                  min={1000}
                  value={orderAmount}
                  onChange={(e) => setOrderAmount(Number(e.target.value) || 0)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="description">Mô tả</Label>
                <Input
                  id="description"
                  value={orderDescription}
                  onChange={(e) => setOrderDescription(e.target.value)}
                  placeholder="Mô tả đơn hàng"
                  className="mt-1"
                />
              </div>
            </div>

            <SePayCheckoutForm
              orderInvoiceNumber={orderInvoiceNumber}
              orderAmount={orderAmount}
              orderDescription={orderDescription}
              successUrl={successUrl}
              errorUrl={errorUrl}
              cancelUrl={cancelUrl}
              buttonText="Thanh toán bằng SePay (QR chuyển khoản)"
              className="w-full"
            />
          </CardContent>
        </Card>
        <p className="mt-4 text-center text-sm text-muted-foreground">
          IPN URL nhận thông báo: <code className="bg-muted px-1 rounded">{origin}/api/sepay-ipn</code>
        </p>
      </div>
    </div>
  );
}
