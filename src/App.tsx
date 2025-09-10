import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { ClientWrapper } from "./components/client-wrapper";
import LocatorSetup from "./components/locator-setup";
import HeaderLayout from "./components/layout/HeaderLayout";
import PageTransition from "./components/layout/PageTransition";
import PageTourWrapper from "./components/guide/PageTourWrapper";
import Footer from "./components/Footer";
import { EmailAuthProvider } from "./contexts/EmailAuthContext";

// Import pages (converted from Next.js)
import HomePage from "./pages/HomePage";
import BlogPage from "./pages/BlogPage";
import GioiThieuPage from "./pages/GioiThieuPage";
import KhoaHocPage from "./pages/KhoaHocPage";
import SanPhamPage from "./pages/SanPhamPage";
import TaiNguyenPage from "./pages/TaiNguyenPage";
import HopTacPage from "./pages/HopTacPage";
import AuthPage from "./pages/AuthPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ResendVerificationPage from "./pages/ResendVerificationPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsOfServicePage from "./pages/TermsOfServicePage";
import SecurityPage from "./pages/SecurityPage";
import AccountManagementPage from "./pages/AccountManagementPage";
import PublicFilesPage from "./pages/PublicFilesPage";
import MarketplacePage from "./pages/MarketplacePage";
import ProfilePage from "./pages/ProfilePage";
import ManagerDashboard from "./pages/ManagerDashboard";
import TermsPrivacy from "./pages/TermsPrivacy";
import PricingPage from "./pages/PricingPage";
import SuccessFreePage from "./pages/SuccessFreePage";
import SuccessPremiumPage from "./pages/SuccessPremiumPage";
import SuccessPartnerPage from "./pages/SuccessPartnerPage";
import InstructionPage from "./pages/InstructionPage";
import EnhancedInstructionPage from "./pages/EnhancedInstructionPage";

function App() {
  return (
    <EmailAuthProvider>
      <Router>
        <div className="App min-h-screen flex flex-col">
          <Routes>
            {/* Auth routes without header/footer */}
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route
              path="/resend-verification"
              element={<ResendVerificationPage />}
            />
            <Route path="/privacy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsOfServicePage />} />
            <Route path="/security" element={<SecurityPage />} />
            <Route path="/account" element={<AccountManagementPage />} />
            <Route path="/terms-privacy" element={<TermsPrivacy />} />

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
                          <PageTourWrapper autoStart={true} delay={3000}>
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
                        path="/gioi-thieu"
                        element={
                          <PageTransition>
                            <GioiThieuPage />
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
                            <MarketplacePage />
                          </PageTransition>
                        }
                      />
                      <Route
                        path="/profile"
                        element={
                          <PageTransition>
                            <ProfilePage />
                          </PageTransition>
                        }
                      />
                      <Route
                        path="/manager"
                        element={
                          <PageTransition>
                            <ManagerDashboard />
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
          <Toaster position="top-right" />
        </div>
      </Router>
    </EmailAuthProvider>
  );
}

export default App;
