/**
 * SePay Checkout Form - Form thanh toán qua SePay (QR chuyển khoản)
 * Gọi API /api/sepay-checkout để lấy checkoutURL + formFields, sau đó render form POST sang SePay.
 * Doc: https://developer.sepay.vn/vi/cong-thanh-toan/bat-dau
 */

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { safeParseJson } from '../../lib/safe-json';
import { Loader2, QrCode } from 'lucide-react';

export interface SePayCheckoutFormProps {
  orderInvoiceNumber: string;
  orderAmount: number;
  orderDescription?: string;
  successUrl: string;
  errorUrl: string;
  cancelUrl: string;
  buttonText?: string;
  className?: string;
  /** Base URL cho API (mặc định window.location.origin) */
  apiBaseUrl?: string;
}

const getApiUrl = (base: string) => {
  const origin = base || (typeof window !== 'undefined' ? window.location.origin : '');
  return `${origin}/api/sepay-checkout`;
};

export function SePayCheckoutForm({
  orderInvoiceNumber,
  orderAmount,
  orderDescription = `Thanh toan don hang ${orderInvoiceNumber}`,
  successUrl,
  errorUrl,
  cancelUrl,
  buttonText = 'Thanh toán bằng SePay (QR chuyển khoản)',
  className = '',
  apiBaseUrl,
}: SePayCheckoutFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutURL, setCheckoutURL] = useState<string | null>(null);
  const [formFields, setFormFields] = useState<Record<string, string>>({});

  const handleGetCheckout = async () => {
    setError(null);
    setLoading(true);
    try {
      const url = getApiUrl(apiBaseUrl || '');
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_invoice_number: orderInvoiceNumber,
          order_amount: orderAmount,
          order_description: orderDescription,
          success_url: successUrl,
          error_url: errorUrl,
          cancel_url: cancelUrl,
        }),
      });
      const text = await res.text();
      const data = safeParseJson<{ checkoutURL?: string; formFields?: Record<string, string>; error?: string }>(text, {});
      if (!res.ok) {
        throw new Error(data.error || 'Không thể tạo phiên thanh toán');
      }
      setCheckoutURL(data.checkoutURL);
      setFormFields(data.formFields || {});
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  // Đã có URL + form fields → render form POST sang SePay
  if (checkoutURL && Object.keys(formFields).length > 0) {
    return (
      <form action={checkoutURL} method="POST" className={className}>
        {Object.entries(formFields).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <Button type="submit" className="w-full" size="lg">
          <QrCode className="mr-2 h-4 w-4" />
          Chuyển đến cổng thanh toán SePay
        </Button>
      </form>
    );
  }

  return (
    <div className={className}>
      <Button
        type="button"
        onClick={handleGetCheckout}
        disabled={loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <QrCode className="mr-2 h-4 w-4" />
        )}
        {loading ? 'Đang tạo phiên thanh toán...' : buttonText}
      </Button>
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export default SePayCheckoutForm;
