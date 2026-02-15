import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, Crown, Handshake, Check, ArrowRight, Loader2, Star } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { toast } from 'sonner';
import { SEO } from '../components/SEO';
import { SUBSCRIPTION_PLANS } from '../config/subscription-plans';

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free: <Lock className="h-6 w-6" />,
  premium: <Crown className="h-6 w-6" />,
  partner: <Handshake className="h-6 w-6" />,
};

const PricingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const status = searchParams.get('status');
  const planParam = searchParams.get('plan');

  const [loading, setLoading] = useState<'premium' | 'partner' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checkoutRedirect, setCheckoutRedirect] = useState<{ url: string; fields: Record<string, string> } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (checkoutRedirect && formRef.current) {
      formRef.current.submit();
    }
  }, [checkoutRedirect]);

  const handleFree = () => {
    toast.success('Đăng ký để sử dụng gói miễn phí', { description: 'Tạo tài khoản hoặc đăng nhập để bắt đầu.' });
    navigate('/dang-nhap');
  };

  const handlePaidPlan = async (plan: 'premium' | 'partner') => {
    setError(null);
    setLoading(plan);
    try {
      const res = await fetch('/api/sepay-subscription-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Không thể tạo phiên thanh toán');
      }
      if (data.checkoutURL && data.formFields) {
        setCheckoutRedirect({ url: data.checkoutURL, fields: data.formFields });
      } else {
        throw new Error('Phản hồi không hợp lệ từ server');
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Có lỗi xảy ra. Vui lòng thử lại.';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SEO
        title="Gói dịch vụ - Thanh toán Premium & Đối tác"
        description="Chọn gói Miễn phí, Hội viên Premium hoặc Đối tác. Thanh toán bảo mật qua SePay."
        url="/goi-dich-vu"
      />

      <div className="container mx-auto px-4 py-10 md:py-16">
        <div className="text-center mb-10 md:mb-14">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Gói dịch vụ</h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Chọn gói phù hợp với bạn. Thanh toán an toàn qua cổng SePay.
          </p>
        </div>

        {status === 'error' && (
          <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto">
            <AlertTitle>Thanh toán thất bại</AlertTitle>
            <AlertDescription>
              Giao dịch không thành công. Bạn có thể thử lại hoặc liên hệ hỗ trợ.
            </AlertDescription>
          </Alert>
        )}
        {status === 'cancel' && (
          <Alert className="mb-6 max-w-2xl mx-auto border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800">
            <AlertTitle>Đã hủy thanh toán</AlertTitle>
            <AlertDescription>Bạn đã hủy. Chọn lại gói bên dưới khi sẵn sàng.</AlertDescription>
          </Alert>
        )}
        {error && (
          <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto" role="alert">
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {checkoutRedirect && (
          <form
            ref={formRef}
            method="POST"
            action={checkoutRedirect.url}
            className="hidden"
            aria-hidden="true"
          >
            {Object.entries(checkoutRedirect.fields).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))}
          </form>
        )}
        {checkoutRedirect && (
          <div className="text-center py-8 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p>Đang chuyển đến cổng thanh toán SePay...</p>
          </div>
        )}

        {!checkoutRedirect && (
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isPaid = plan.id === 'premium' || plan.id === 'partner';
              const isLoading = isPaid && loading === plan.id;
              return (
                <Card
                  key={plan.id}
                  className={`relative border-2 transition-all hover:shadow-lg overflow-visible ${
                    plan.popular
                      ? 'border-primary shadow-lg scale-[1.02] md:scale-105'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10 whitespace-nowrap">
                      <Badge className="flex items-center justify-center gap-1.5 bg-primary text-primary-foreground px-4 py-1.5 shadow-md">
                        <Star className="h-3 w-3 fill-current shrink-0" />
                        Phổ biến nhất
                      </Badge>
                    </div>
                  )}
                  <CardHeader className={`text-center pb-6 ${plan.popular ? 'pt-8' : ''}`}>
                    <div
                      className={`flex justify-center mb-4 p-3 rounded-full mx-auto ${
                        plan.popular ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {PLAN_ICONS[plan.id]}
                    </div>
                    <CardTitle className="text-2xl text-foreground">{plan.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">{plan.description}</CardDescription>
                    <div className="mt-4">
                      <span className="text-4xl font-bold text-foreground">{plan.priceDisplay}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="font-semibold text-foreground">Tính năng bao gồm:</h4>
                      <ul className="space-y-2">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2">
                            <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                            <span className="text-sm text-muted-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    {plan.limitations.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-semibold text-destructive">Hạn chế:</h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, i) => (
                            <li key={i} className="flex items-start gap-2">
                              <Lock className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
                              <span className="text-sm text-destructive/90">{limitation}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {plan.id === 'free' ? (
                      <Button
                        variant="outline"
                        size="lg"
                        className="w-full"
                        onClick={handleFree}
                      >
                        {plan.buttonText}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    ) : (
                      <Button
                        variant={plan.popular ? 'default' : 'default'}
                        size="lg"
                        className="w-full"
                        disabled={!!loading}
                        onClick={() => handlePaidPlan(plan.id)}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Đang tạo phiên thanh toán...
                          </>
                        ) : (
                          <>
                            {plan.buttonText}
                            <ArrowRight className="h-4 w-4 ml-2" />
                          </>
                        )}
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PricingPage;
