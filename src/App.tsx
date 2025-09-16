import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { ToastProvider } from "./components/ui/toast";
import { NotificationProvider } from "./components/ui/notification";
import { ClientWrapper } from "./components/client-wrapper";
import LocatorSetup from "./components/locator-setup";
import SimpleFloatingMenu from "./components/navigation/simple-floating-menu";
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

// Lazy load pages for better performance
const HomePage = React.lazy(() => import("./pages/HomePage"));
const BlogPage = React.lazy(() => import("./pages/BlogPage"));
const BlogPostPage = React.lazy(() => import("./pages/BlogPostPage"));
const GioiThieuPage = React.lazy(() => import("./pages/GioiThieuPage"));
const KhoaHocPage = React.lazy(() => import("./pages/KhoaHocPage"));
const SanPhamPage = React.lazy(() => import("./pages/SanPhamPage"));
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
const PublicFilesPage = React.lazy(() => import("./pages/PublicFilesPage"));
const SimpleMarketplacePage = React.lazy(
  () => import("./pages/SimpleMarketplacePage")
);
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
const InstructionPage = React.lazy(() => import("./pages/InstructionPage"));
const EnhancedInstructionPage = React.lazy(
  () => import("./pages/EnhancedInstructionPage")
);

function App() {
  // Debug configuration in development
  React.useEffect(() => {
    config.debug();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UnifiedAuthProvider>
          <CartProvider>
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
                        path="/auth"
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
                        path="/verify-email"
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
                        path="/forgot-password"
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
                        path="/reset-password"
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
                        path="/resend-verification"
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
                        path="/privacy"
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
                        path="/terms"
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
                        path="/security"
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
                        path="/account"
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
                        path="/terms-privacy"
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
                                  path="/huong-dan-cu"
                                  element={
                                    <PageTransition>
                                      <InstructionPage />
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
                                  path="/blog"
                                  element={
                                    <PageTransition>
                                      <BlogPage />
                                    </PageTransition>
                                  }
                                />
                                <Route
                                  path="/blog/:id"
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
                                      <SanPhamPage />
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
                                  path="/marketplace"
                                  element={
                                    <PageTransition>
                                      <SimpleMarketplacePage />
                                    </PageTransition>
                                  }
                                />
                                <Route
                                  path="/profile"
                                  element={
                                    <ProtectedRoute>
                                      <PageTransition>
                                        <ProfilePage />
                                      </PageTransition>
                                    </ProtectedRoute>
                                  }
                                />
                                <Route
                                  path="/manager"
                                  element={
                                    <AdminRoute>
                                      <PageTransition>
                                        <ManagerDashboard />
                                      </PageTransition>
                                    </AdminRoute>
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
                    <SimpleFloatingMenu />
                    <Toaster position="top-right" />
                  </div>
                </Router>
              </NotificationProvider>
            </ToastProvider>
          </CartProvider>
        </UnifiedAuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
