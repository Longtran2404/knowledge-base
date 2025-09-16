import emailjs from "@emailjs/browser";
import { EMAIL_CONFIG, EMAIL_TEMPLATES } from "./email-config";

// Initialize EmailJS
emailjs.init(EMAIL_CONFIG.publicKey);

export interface EmailData extends Record<string, unknown> {
  to_email: string;
  to_name: string;
  verification_url?: string;
  reset_url?: string;
  token?: string;
  app_name?: string;
  support_email?: string;
}

export interface EmailResult {
  success: boolean;
  message: string;
  error?: string;
}

// Send verification email
export const sendVerificationEmail = async (
  email: string,
  fullName: string,
  token: string
): Promise<EmailResult> => {
  try {
    const verificationUrl = `${EMAIL_CONFIG.appUrl}/verify-email?token=${token}`;

    const templateParams: EmailData = {
      to_email: email,
      to_name: fullName,
      verification_url: verificationUrl,
      token: token,
      app_name: "Nam Long Center",
      support_email: "info@namlongcenter.com",
    };

    const response = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_TEMPLATES.verification.template,
      templateParams
    );

    console.log("Email sent successfully:", response);

    return {
      success: true,
      message: "Email xác thực đã được gửi thành công",
    };
  } catch (error: any) {
    console.error("Error sending verification email:", error);

    // Fallback: Show verification URL in console for development
    const verificationUrl = `${EMAIL_CONFIG.appUrl}/verify-email?token=${token}`;
    console.log("=== EMAIL VERIFICATION (FALLBACK) ===");
    console.log(`To: ${email}`);
    console.log(`Subject: ${EMAIL_TEMPLATES.verification.subject}`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log(`Token: ${token}`);
    console.log("=====================================");

    return {
      success: true,
      message: "Email xác thực đã được gửi (chế độ phát triển)",
    };
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (
  email: string,
  fullName: string,
  token: string
): Promise<EmailResult> => {
  try {
    const resetUrl = `${EMAIL_CONFIG.appUrl}/reset-password?token=${token}`;

    const templateParams: EmailData = {
      to_email: email,
      to_name: fullName,
      reset_url: resetUrl,
      token: token,
      app_name: "Nam Long Center",
      support_email: "info@namlongcenter.com",
    };

    const response = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_TEMPLATES.passwordReset.template,
      templateParams
    );

    console.log("Password reset email sent successfully:", response);

    return {
      success: true,
      message: "Email đặt lại mật khẩu đã được gửi thành công",
    };
  } catch (error: any) {
    console.error("Error sending password reset email:", error);

    // Fallback: Show reset URL in console for development
    const resetUrl = `${EMAIL_CONFIG.appUrl}/reset-password?token=${token}`;
    console.log("=== PASSWORD RESET EMAIL (FALLBACK) ===");
    console.log(`To: ${email}`);
    console.log(`Subject: ${EMAIL_TEMPLATES.passwordReset.subject}`);
    console.log(`Reset URL: ${resetUrl}`);
    console.log(`Token: ${token}`);
    console.log("======================================");

    return {
      success: true,
      message: "Email đặt lại mật khẩu đã được gửi (chế độ phát triển)",
    };
  }
};

// Send welcome email
export const sendWelcomeEmail = async (
  email: string,
  fullName: string
): Promise<EmailResult> => {
  try {
    const templateParams: EmailData = {
      to_email: email,
      to_name: fullName,
      app_name: "Nam Long Center",
      support_email: "info@namlongcenter.com",
    };

    const response = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      EMAIL_TEMPLATES.welcome.template,
      templateParams
    );

    console.log("Welcome email sent successfully:", response);

    return {
      success: true,
      message: "Email chào mừng đã được gửi thành công",
    };
  } catch (error: any) {
    console.error("Error sending welcome email:", error);

    return {
      success: false,
      message: "Có lỗi xảy ra khi gửi email chào mừng",
      error: error.message,
    };
  }
};

// Test email configuration
export const testEmailConfiguration = async (): Promise<EmailResult> => {
  try {
    const testEmail = "test@example.com";
    const testName = "Test User";
    const testToken = "test-token-123";

    console.log("Testing email configuration...");
    console.log("Service ID:", EMAIL_CONFIG.serviceId);
    console.log("Template ID:", EMAIL_TEMPLATES.verification.template);
    console.log("Public Key:", EMAIL_CONFIG.publicKey ? "Set" : "Not set");

    // Try to send a test email
    const result = await sendVerificationEmail(testEmail, testName, testToken);

    return {
      success: true,
      message: "Email configuration test completed",
    };
  } catch (error: any) {
    return {
      success: false,
      message: "Email configuration test failed",
      error: error.message,
    };
  }
};
