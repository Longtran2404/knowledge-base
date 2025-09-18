import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { ToastProvider } from "./components/ui/toast";
import { NotificationProvider } from "./components/ui/notification";
import { EnhancedToastProvider } from "./components/ui/enhanced-toast";
import { NotificationProvider as EnhancedNotificationProvider } from "./contexts/NotificationContext";
import { ClientWrapper } from "./components/client-wrapper";
import LocatorSetup from "./components/locator-setup";
import LiquidGlassQuickMenu from "./components/navigation/LiquidGlassQuickMenu";
import HeaderLayout from "./components/layout/HeaderLayout";
import PageTransition from "./components/layout/PageTransition";
import PageTourWrapper from "./components/guide/PageTourWrapper";
import Footer from "./components/Footer";
import { ScrollToTop } from "./components/ui/scroll-to-top";
import { ErrorBoundary } from "./components/ui/error-boundary";
import { SkipToContent } from "./components/ui/accessibility";
import { Loading } from "./components/ui/loading";
import { UnifiedAuthProvider } from "./contexts/UnifiedAuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import { ProtectedRoute, AdminRoute } from "./components/auth/ProtectedRoute";
import { config } from "./services/config";
import { errorHandler } from "./lib/error-handler";

// Lazy load pages for better performance
const HomePage = React.lazy(() => import("./pages/HomePage"));
const BlogPage = React.lazy(() => import("./pages/BlogPage"));
const BlogPostPage = React.lazy(() => import("./pages/BlogPostPage"));
const GioiThieuPage = React.lazy(() => import("./pages/GioiThieuPage"));
const KhoaHocPage = React.lazy(() => import("./pages/KhoaHocPage"));
const ProductsPage = React.lazy(() => import("./pages/ProductsPage"));
const TaiNguyenPage = React.lazy(() => import("./pages/TaiNguyenPage"));
const HopTacPage = React.lazy(() => import("./pages/HopTacPage"));
const AuthPage = React.lazy(() => import("./pages/AuthPage"));
const VerifyEmailPage = React.lazy(() => import("./pages/VerifyEmailPage"));
const ForgotPasswordPage = React.lazy(
  () => import("./pages/ForgotPasswordPage")
);
const ResetPasswordPage = React.lazy(() => import("./pages/ResetPasswordPage"));
const ResendVerificationPage = React.lazy(
  () => import("./pages/ResendVerificationPage")
);
const PrivacyPolicyPage = React.lazy(() => import("./pages/PrivacyPolicyPage"));
const TermsOfServicePage = React.lazy(
  () => import("./pages/TermsOfServicePage")
);
const SecurityPage = React.lazy(() => import("./pages/SecurityPage"));
const AccountManagementPage = React.lazy(
  () => import("./pages/AccountManagementPage")
);
const ActivityDashboard = React.lazy(() => import("./pages/ActivityDashboard"));
const PublicFilesPage = React.lazy(() => import("./pages/PublicFilesPage"));
const MarketplacePage = React.lazy(() => import("./pages/MarketplacePage"));
const ProfilePage = React.lazy(() => import("./pages/ProfilePage"));
const ManagerDashboard = React.lazy(() => import("./pages/ManagerDashboard"));
const TermsPrivacy = React.lazy(() => import("./pages/TermsPrivacy"));
const PricingPage = React.lazy(() => import("./pages/PricingPage"));
const SuccessFreePage = React.lazy(() => import("./pages/SuccessFreePage"));
const SuccessPremiumPage = React.lazy(
  () => import("./pages/SuccessPremiumPage")
);
const SuccessPartnerPage = React.lazy(
  () => import("./pages/SuccessPartnerPage")
);
const EnhancedInstructionPage = React.lazy(
  () => import("./pages/EnhancedInstructionPage")
);
const UploadPage = React.lazy(() => import("./pages/UploadPage"));
const NotificationDemo = React.lazy(() => import("./components/demo/NotificationDemo"));

function App() {
  // Debug configuration in development
  React.useEffect(() => {
    config.debug();
  }, []);

  // Initialize global error handling
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      errorHandler.wrapError(event.reason, {
        operation: 'unhandled_promise_rejection',
        component: 'App',
        timestamp: new Date().toISOString(),
      });
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error:', event.error);
      errorHandler.wrapError(event.error, {
        operation: 'global_error',
        component: 'App',
        timestamp: new Date().toISOString(),
      });
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UnifiedAuthProvider>
          <CartProvider>
            <EnhancedNotificationProvider>
              <EnhancedToastProvider>
            <ToastProvider>
              <NotificationProvider>
                <Router
                  future={{
                    v7_startTransition: true,
                    v7_relativeSplatPath: true,
                  }}
                >
                  <div className="App min-h-screen flex flex-col">
                    <SkipToContent />
                    <ScrollToTop />
                    <Routes>
                      {/* Auth routes without header/footer */}
                      <Route
                        path="/dang-nhap"
                        element={
                          <Suspense
                            fallback={
                              <Loading
                                size="lg"
                                variant="spinner"
                                text="Đang tải trang đăng nhập..."
                              />
                            }
                          >
                            <AuthPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/xac-minh-email"
                        element={
                          <Suspense
                            fallback={
                              <div className="min-h-screen flex items-center justify-center">
                                <div className="animate-pulse">Đang tải...</div>
                              </div>
                            }
                          >
                            <VerifyEmailPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/quen-mat-khau"
                        element={
                          <Suspense
                            fallback={
                              <div className="min-h-screen flex items-center justify-center">
                                <div className="animate-pulse">Đang tải...</div>
                              </div>
                            }
                          >
                            <ForgotPasswordPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/dat-lai-mat-khau"
                        element={
                          <Suspense
                            fallback={
                              <div className="min-h-screen flex items-center justify-center">
                                <div className="animate-pulse">Đang tải...</div>
                              </div>
                            }
                          >
                            <ResetPasswordPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/gui-lai-xac-minh"
                        element={
                          <Suspense
                            fallback={
                              <div className="min-h-screen flex items-center justify-center">
                                <div className="animate-pulse">Đang tải...</div>
                              </div>
                            }
                          >
                            <ResendVerificationPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/chinh-sach-bao-mat"
                        element={
                          <Suspense
                            fallback={
                              <div className="min-h-screen flex items-center justify-center">
                                <div className="animate-pulse">Đang tải...</div>
                              </div>
                            }
                          >
                            <PrivacyPolicyPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/dieu-khoan-su-dung"
                        element={
                          <Suspense
                            fallback={
                              <div className="min-h-screen flex items-center justify-center">
                                <div className="animate-pulse">Đang tải...</div>
                              </div>
                            }
                          >
                            <TermsOfServicePage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/bao-mat"
                        element={
                          <Suspense
                            fallback={
                              <div className="min-h-screen flex items-center justify-center">
                                <div className="animate-pulse">Đang tải...</div>
                              </div>
                            }
                          >
                            <SecurityPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/quan-ly-tai-khoan"
                        element={
                          <Suspense
                            fallback={
                              <div className="min-h-screen flex items-center justify-center">
                                <div className="animate-pulse">Đang tải...</div>
                              </div>
                            }
                          >
                            <AccountManagementPage />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/lich-su-hoat-dong"
                        element={
                          <ProtectedRoute>
                            <Suspense
                              fallback={
                                <div className="min-h-screen flex items-center justify-center">
                                  <div className="animate-pulse">Đang tải...</div>
                                </div>
                              }
                            >
                              <ActivityDashboard />
                            </Suspense>
                          </ProtectedRoute>
                        }
                      />
                      <Route
                        path="/dieu-khoan-bao-mat"
                        element={
                          <Suspense
                            fallback={
                              <div className="min-h-screen flex items-center justify-center">
                                <div className="animate-pulse">Đang tải...</div>
                              </div>
                            }
                          >
                            <TermsPrivacy />
                          </Suspense>
                        }
                      />
                      <Route
                        path="/gioi-thieu"
                        element={
                          <Suspense
                            fallback={
                              <div className="min-h-screen flex items-center justify-center">
                                <div className="animate-pulse">Đang tải...</div>
                              </div>
                            }
                          >
                            <GioiThieuPage />
                          </Suspense>
                        }
                      />

                      {/* Main routes with conditional header/footer */}
                      <Route
                        path="/*"
                        element={
                          <HeaderLayout>
                            <main className="flex-1">
                              <Routes>
                                <Route
                                  path="/goi-dich-vu"
                                  element={
                                    <PageTransition>
                                      <PricingPage />
                                    </PageTransition>
                                  }
                                />
                                <Route
                                  path="/huong-dan"
                                  element={
                                    <PageTransition>
                                      <EnhancedInstructionPage />
                                    </PageTransition>
                                  }
                                />
                                <Route
                                  path="/thanh-cong/free"
                                  element={
                                    <PageTransition>
                                      <SuccessFreePage />
                                    </PageTransition>
                                  }
                                />
                                <Route
                                  path="/thanh-cong/premium"
                                  element={
                                    <PageTransition>
                                      <SuccessPremiumPage />
                                    </PageTransition>
                                  }
                                />
                                <Route
                                  path="/thanh-cong/partner"
                                  element={
                                    <PageTransition>
                                      <SuccessPartnerPage />
                                    </PageTransition>
                                  }
                                />
                                <Route
                                  path="/"
                                  element={
                                    <PageTransition>
                                      <GioiThieuPage />
                                    </PageTransition>
                                  }
                                />
                                <Route
                                  path="/trang-chu"
                                  element={
                                    <PageTourWrapper
                                      autoStart={true}
                                      delay={3000}
                                    >
                                      <PageTransition>
                                        <HomePage />
                                      </PageTransition>
                                    </PageTourWrapper>
                                  }
                                />
                                <Route
                                  path="/bai-viet"
                                  element={
                                    <PageTransition>
                                      <BlogPage />
                                    </PageTransition>
                                  }
                                />
                                <Route
                                  path="/bai-viet/:id"
                                  element={
                                    <PageTransition>
                                      <BlogPostPage />
                                    </PageTransition>
                                  }
                                />
                                <Route
                                  path="/khoa-hoc"
                                  element={
                                    <PageTransition>
                                      <KhoaHocPage />
                                    </PageTransition>
                                  }
                                />
                                <Route
                                  path="/khoa-hoc/:category"
                                  element={
                                    <PageTransition>
                                      <KhoaHocPage />
                                    </PageTransition>
                                  }
                                />
                                <Route
                                  path="/san-pham"
                                  element={
                                    <PageTransition>
                                      <ProductsPage />
                                    </PageTransition>
                                  }
                                />
                                <Route
                                  path="/tai-nguyen"
                                  element={
                                    <PageTransition>
                                      <TaiNguyenPage />
                                    </PageTransition>
                                  }
                                />
                                <Route
                                  path="/tai-lieu"
                                  element={
                                    <PageTransition>
                                      <PublicFilesPage />
                                    </PageTransition>
                                  }
                                />
                                <Route
                                  path="/hop-tac"
                                  element={
                                    <PageTransition>
                                      <HopTacPage />
                                    </PageTransition>
                                  }
                                />
                                <Route
                                  path="/cho-mua-ban"
                                  element={
                                    <PageTransition>
                                      <MarketplacePage />
                                    </PageTransition>
                                  }
                                />
                                <Route
                                  path="/ho-so"
                                  element={
                                    <ProtectedRoute>
                                      <PageTransition>
                                        <ProfilePage />
                                      </PageTransition>
                                    </ProtectedRoute>
                                  }
                                />
                                <Route
                                  path="/quan-ly"
                                  element={
                                    <AdminRoute>
                                      <PageTransition>
                                        <ManagerDashboard />
                                      </PageTransition>
                                    </AdminRoute>
                                  }
                                />
                                <Route
                                  path="/tai-len"
                                  element={
                                    <ProtectedRoute>
                                      <PageTransition>
                                        <UploadPage />
                                      </PageTransition>
                                    </ProtectedRoute>
                                  }
                                />
                                <Route
                                  path="/demo/notifications"
                                  element={
                                    <PageTransition>
                                      <NotificationDemo />
                                    </PageTransition>
                                  }
                                />
                              </Routes>
                            </main>
                            <Footer />
                            <ClientWrapper />
                          </HeaderLayout>
                        }
                      />
                    </Routes>

                    <LocatorSetup />
                    <LiquidGlassQuickMenu />
                    <Toaster 
                      position="top-center" 
                      toastOptions={{
                        style: {
                          marginTop: '80px', // Để tránh chen với header
                          zIndex: 9999
                        }
                      }}
                    />
                  </div>
                </Router>
              </NotificationProvider>
            </ToastProvider>
              </EnhancedToastProvider>
            </EnhancedNotificationProvider>
          </CartProvider>
        </UnifiedAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
