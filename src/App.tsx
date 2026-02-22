import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import { ToastProvider } from "./components/ui/toast";
import { NotificationProvider } from "./components/ui/notification";
import { EnhancedToastProvider } from "./components/ui/enhanced-toast";
import { NotificationProvider as EnhancedNotificationProvider } from "./contexts/NotificationContext";
import { ClientWrapper } from "./components/client-wrapper";
// LocatorSetup tạm tắt - @locator/runtime không tương thích solid-js với Next.js 15
// import LocatorSetup from "./components/locator-setup";
import { ModernSidebarV2 } from "./components/navigation/ModernSidebarV2";
import HeaderLayout from "./components/layout/HeaderLayout";
import PageTransition from "./components/layout/PageTransition";
import PageTourWrapper from "./components/guide/PageTourWrapper";
import Footer from "./components/Footer";
import { ScrollToTop } from "./components/ui/scroll-to-top";
import { ScrollToTopOnMount } from "./components/ScrollToTopOnMount";
import { ErrorBoundary } from "./components/ui/error-boundary";
import { SkipToContent } from "./components/ui/accessibility";
import { Loading } from "./components/ui/loading";
import { UnifiedAuthProvider } from "./contexts/UnifiedAuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { CartProvider } from "./contexts/CartContext";
import { GlobalDataProvider } from "./contexts/GlobalDataContext";
import { ChatProvider } from "./contexts/ChatContext";
import { ChatWidget } from "./components/chat/ChatWidget";
import { ProtectedRoute, AdminRoute } from "./components/auth/ProtectedRoute";
import { config } from "./services/config";
import { errorHandler } from "./lib/error-handler";
// import { ThreadsBackgroundStatic } from "./components/ui/threads-background"; // Removed
// import Galaxy from "./components/Galaxy"; // Removed - causing lag
import { logger } from "./lib/logger/logger";

// Lazy load pages for better performance
const HomePage = React.lazy(() => import("./views/HomePage"));
const BlogPage = React.lazy(() => import("./views/BlogPage"));
const BlogPostPage = React.lazy(() => import("./views/BlogPostPage"));
const GioiThieuPage = React.lazy(() => import("./views/EnhancedGioiThieuPage"));
const KhoaHocPage = React.lazy(() => import("./views/KhoaHocPage"));
const ProductsPage = React.lazy(() => import("./views/ProductsPage"));
const TaiNguyenPage = React.lazy(() => import("./views/TaiNguyenPage"));
const HopTacPage = React.lazy(() => import("./views/HopTacPage"));
const AuthPage = React.lazy(() => import("./views/AuthPage"));
const VerifyEmailPage = React.lazy(() => import("./views/VerifyEmailPage"));
const ForgotPasswordPage = React.lazy(
  () => import("./views/ForgotPasswordPage")
);
const ResetPasswordPage = React.lazy(() => import("./views/ResetPasswordPage"));
const ResendVerificationPage = React.lazy(
  () => import("./views/ResendVerificationPage")
);
const ChoXacMinhEmailPage = React.lazy(
  () => import("./views/ChoXacMinhEmailPage")
);
const PrivacyPolicyPage = React.lazy(() => import("./views/PrivacyPolicyPage"));
const TermsOfServicePage = React.lazy(
  () => import("./views/TermsOfServicePage")
);
const SecurityPage = React.lazy(() => import("./views/SecurityPage"));
const AccountManagementPage = React.lazy(
  () => import("./views/AccountManagementPage")
);
const ChangePasswordPage = React.lazy(
  () => import("./views/ChangePasswordPage")
);
const ActivityDashboard = React.lazy(() => import("./views/ActivityDashboard"));
const PublicFilesPage = React.lazy(() => import("./views/PublicFilesPage"));
const MarketplacePage = React.lazy(() => import("./views/MarketplacePage"));
const ProfilePage = React.lazy(() => import("./views/ProfilePage"));
const ManagerDashboard = React.lazy(() => import("./views/ManagerDashboard"));
const SupportPage = React.lazy(() => import("./views/SupportPage"));
const FAQPage = React.lazy(() => import("./views/FAQPage"));
const ContactPage = React.lazy(() => import("./views/ContactPage"));
const TermsPrivacy = React.lazy(() => import("./views/TermsPrivacy"));
const PricingPage = React.lazy(() => import("./views/PricingPage"));
const SePayPaymentPage = React.lazy(() => import("./views/SePayPaymentPage"));
const SuccessFreePage = React.lazy(() => import("./views/SuccessFreePage"));
const SuccessPremiumPage = React.lazy(
  () => import("./views/SuccessPremiumPage")
);
const SuccessPartnerPage = React.lazy(
  () => import("./views/SuccessPartnerPage")
);
const EnhancedInstructionPage = React.lazy(
  () => import("./views/EnhancedInstructionPage")
);
const UploadPage = React.lazy(() => import("./views/UploadPage"));
const NotificationDemo = React.lazy(
  () => import("./components/demo/NotificationDemo")
);

// Workflow Marketplace pages
const WorkflowMarketplacePage = React.lazy(
  () => import("./views/WorkflowMarketplacePage")
);
const WorkflowCheckoutPage = React.lazy(
  () => import("./views/WorkflowCheckoutPage")
);
const WorkflowManagementPage = React.lazy(
  () => import("./views/WorkflowManagementPage")
);
const ShowcasePage = React.lazy(() => import("./views/ShowcasePage"));
const PaymentVerificationPage = React.lazy(() => import("./views/admin/PaymentVerificationPage"));

// CMS & Payment Management pages
const AdminCMSPage = React.lazy(() => import("./views/AdminCMSPage"));
const PaymentMethodsManagementPage = React.lazy(
  () => import("./views/PaymentMethodsManagementPage")
);

// Account Upgrade page
const AccountUpgradePage = React.lazy(() => import("./views/AccountUpgradePage"));

// Admin Dashboard & Subscription Management
const AdminDashboardPage = React.lazy(() => import("./views/AdminDashboardPage"));
const AdminSubscriptionManagementPage = React.lazy(() => import("./views/AdminSubscriptionManagementPage"));
const AdminSetupPage = React.lazy(() => import("./views/AdminSetupPage"));
const AdminUsersPage = React.lazy(() => import("./views/AdminUsersPage"));

function App() {
  // Debug configuration in development
  React.useEffect(() => {
    config.debug();
  }, []);

  // Initialize global error handling
  React.useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      logger.error("Unhandled promise rejection", event.reason, {
        component: "App",
        operation: "unhandled_promise_rejection",
      });
      errorHandler.wrapError(event.reason, {
        operation: "unhandled_promise_rejection",
        component: "App",
        timestamp: new Date().toISOString(),
      });
      event.preventDefault();
    };

    const handleError = (event: ErrorEvent) => {
      // Suppress ResizeObserver errors (non-critical UI errors)
      if (event.message?.includes('ResizeObserver')) {
        event.preventDefault();
        return;
      }

      logger.error("Global error", event.error, {
        component: "App",
        operation: "global_error",
      });
      errorHandler.wrapError(event.error, {
        operation: "global_error",
        component: "App",
        timestamp: new Date().toISOString(),
      });
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleError);

    return () => {
      window.removeEventListener(
        "unhandledrejection",
        handleUnhandledRejection
      );
      window.removeEventListener("error", handleError);
    };
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <UnifiedAuthProvider>
          <GlobalDataProvider>
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
                      <ChatProvider>
                        <div className="App min-h-screen flex flex-col bg-background overflow-x-hidden max-w-full">
                          {/* Theme trắng + xanh, ít hiệu ứng để giảm lag */}
                          <ModernSidebarV2 />
                          <ChatWidget />
                        <SkipToContent />
                        <ScrollToTop />
                        <ScrollToTopOnMount />
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
                                    <div className="animate-pulse">
                                      Đang tải...
                                    </div>
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
                                    <div className="animate-pulse">
                                      Đang tải...
                                    </div>
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
                                    <div className="animate-pulse">
                                      Đang tải...
                                    </div>
                                  </div>
                                }
                              >
                                <ResetPasswordPage />
                              </Suspense>
                            }
                          />
                          <Route
                            path="/reset-password"
                            element={
                              <Suspense
                                fallback={
                                  <div className="min-h-screen flex items-center justify-center">
                                    <div className="animate-pulse">
                                      Đang tải...
                                    </div>
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
                                    <div className="animate-pulse">
                                      Đang tải...
                                    </div>
                                  </div>
                                }
                              >
                                <ResendVerificationPage />
                              </Suspense>
                            }
                          />
                          <Route
                            path="/cho-xac-minh-email"
                            element={
                              <Suspense
                                fallback={
                                  <div className="min-h-screen flex items-center justify-center">
                                    <div className="animate-pulse">
                                      Đang tải...
                                    </div>
                                  </div>
                                }
                              >
                                <ChoXacMinhEmailPage />
                              </Suspense>
                            }
                          />
                          <Route
                            path="/chinh-sach-bao-mat"
                            element={
                              <Suspense
                                fallback={
                                  <div className="min-h-screen flex items-center justify-center">
                                    <div className="animate-pulse">
                                      Đang tải...
                                    </div>
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
                                    <div className="animate-pulse">
                                      Đang tải...
                                    </div>
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
                                    <div className="animate-pulse">
                                      Đang tải...
                                    </div>
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
                              <ProtectedRoute>
                                <Suspense
                                  fallback={
                                    <div className="min-h-screen flex items-center justify-center">
                                      <div className="animate-pulse">
                                        Đang tải...
                                      </div>
                                    </div>
                                  }
                                >
                                  <AccountManagementPage />
                                </Suspense>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/change-password"
                            element={
                              <Suspense
                                fallback={
                                  <div className="min-h-screen flex items-center justify-center">
                                    <div className="animate-pulse">
                                      Đang tải...
                                    </div>
                                  </div>
                                }
                              >
                                <ChangePasswordPage />
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
                                      <div className="animate-pulse">
                                        Đang tải...
                                      </div>
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
                                    <div className="animate-pulse">
                                      Đang tải...
                                    </div>
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
                                    <div className="animate-pulse">
                                      Đang tải...
                                    </div>
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
                                <main className="flex-1 min-h-0 min-w-0 overflow-x-hidden">
                                  <Suspense
                                    fallback={
                                      <div className="flex items-center justify-center py-24 text-muted-foreground">
                                        <span className="animate-pulse">Đang tải...</span>
                                      </div>
                                    }
                                  >
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
                                      path="/thanh-toan-sepay"
                                      element={
                                        <PageTransition>
                                          <Suspense fallback={<Loading size="lg" variant="spinner" text="Đang tải..." />}>
                                            <SePayPaymentPage />
                                          </Suspense>
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
                                        <ErrorBoundary>
                                          <PageTransition>
                                            <HopTacPage />
                                          </PageTransition>
                                        </ErrorBoundary>
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

                                    {/* Workflow Marketplace Routes */}
                                    <Route
                                      path="/workflows"
                                      element={
                                        <PageTransition>
                                          <WorkflowMarketplacePage />
                                        </PageTransition>
                                      }
                                    />
                                    <Route
                                      path="/workflows/:slug"
                                      element={
                                        <PageTransition>
                                          <WorkflowMarketplacePage />
                                        </PageTransition>
                                      }
                                    />
                                    <Route
                                      path="/workflows/:slug/checkout"
                                      element={
                                        <PageTransition>
                                          <WorkflowCheckoutPage />
                                        </PageTransition>
                                      }
                                    />
                                    <Route
                                      path="/admin/workflows"
                                      element={
                                        <ProtectedRoute allowedRoles={['admin', 'giang_vien', 'quan_ly']}>
                                          <PageTransition>
                                            <WorkflowManagementPage />
                                          </PageTransition>
                                        </ProtectedRoute>
                                      }
                                    />
                                    <Route
                                      path="/admin/dashboard"
                                      element={
                                        <ProtectedRoute allowedRoles={['admin']}>
                                          <PageTransition>
                                            <AdminDashboardPage />
                                          </PageTransition>
                                        </ProtectedRoute>
                                      }
                                    />
                                    <Route
                                      path="/admin/users"
                                      element={
                                        <ProtectedRoute allowedRoles={['admin']}>
                                          <PageTransition>
                                            <AdminUsersPage />
                                          </PageTransition>
                                        </ProtectedRoute>
                                      }
                                    />
                                    <Route
                                      path="/admin/cms"
                                      element={
                                        <ProtectedRoute allowedRoles={['admin']}>
                                          <PageTransition>
                                            <AdminCMSPage />
                                          </PageTransition>
                                        </ProtectedRoute>
                                      }
                                    />
                                    <Route
                                      path="/admin/payment-methods"
                                      element={
                                        <ProtectedRoute allowedRoles={['admin']}>
                                          <PageTransition>
                                            <PaymentMethodsManagementPage />
                                          </PageTransition>
                                        </ProtectedRoute>
                                      }
                                    />
                                    <Route
                                      path="/admin/subscriptions"
                                      element={
                                        <ProtectedRoute allowedRoles={['admin']}>
                                          <PageTransition>
                                            <AdminSubscriptionManagementPage />
                                          </PageTransition>
                                        </ProtectedRoute>
                                      }
                                    />
                                    <Route
                                      path="/admin/setup"
                                      element={
                                        <PageTransition>
                                          <AdminSetupPage />
                                        </PageTransition>
                                      }
                                    />
                                    <Route
                                      path="/account/upgrade"
                                      element={
                                        <PageTransition>
                                          <AccountUpgradePage />
                                        </PageTransition>
                                      }
                                    />

                                    <Route
                                      path="/support"
                                      element={
                                        <PageTransition>
                                          <SupportPage />
                                        </PageTransition>
                                      }
                                    />
                                    <Route
                                      path="/faq"
                                      element={
                                        <PageTransition>
                                          <FAQPage />
                                        </PageTransition>
                                      }
                                    />
                                    <Route
                                      path="/contact"
                                      element={
                                        <PageTransition>
                                          <ContactPage />
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
                                      path="/admin/thanh-toan"
                                      element={
                                        <AdminRoute>
                                          <PageTransition>
                                            <PaymentVerificationPage />
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
                                    <Route
                                      path="/showcase"
                                      element={
                                        <PageTransition>
                                          <ShowcasePage />
                                        </PageTransition>
                                      }
                                    />
                                  </Routes>
                                  </Suspense>
                                </main>
                                <Footer />
                                <ClientWrapper />
                              </HeaderLayout>
                            }
                          />
                        </Routes>

                        {/* <LocatorSetup /> - tạm tắt */}
                        <Toaster
                          position="top-center"
                          toastOptions={{
                            style: {
                              marginTop: "80px", // Để tránh chen với header
                              zIndex: 9999,
                            },
                          }}
                        />
                      </div>
                      </ChatProvider>
                    </Router>
                  </NotificationProvider>
                </ToastProvider>
              </EnhancedToastProvider>
            </EnhancedNotificationProvider>
          </CartProvider>
        </GlobalDataProvider>
      </UnifiedAuthProvider>
    </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
