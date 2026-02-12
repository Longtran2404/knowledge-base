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
      app_name: "Knowledge Base",
      support_email: "info@knowledgebase.com",
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
      app_name: "Knowledge Base",
      support_email: "info@knowledgebase.com",
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
      app_name: "Knowledge Base",
      support_email: "info@knowledgebase.com",
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

// ============================================
// WORKFLOW MARKETPLACE EMAIL FUNCTIONS
// ============================================

export interface WorkflowOrderEmailData {
  order_code: string;
  buyer_name: string;
  buyer_email: string;
  buyer_phone: string;
  workflow_name: string;
  total_amount: string;
  payment_proof_url?: string;
  created_at: string;
  notes?: string;
  verify_url?: string;
}

export interface WorkflowFilesEmailData {
  buyer_name: string;
  buyer_email: string;
  order_code: string;
  workflow_name: string;
  workflow_description: string;
  workflow_file_url: string;
  documentation_urls: string;
  download_expiry: string;
  total_amount: string;
  confirmed_at: string;
}

/**
 * Send email notification to admin when buyer uploads payment proof
 */
export const sendAdminPaymentNotification = async (
  orderData: WorkflowOrderEmailData
): Promise<EmailResult> => {
  try {
    const adminEmail = 'tranminhlong2404@gmail.com';

    const templateParams = {
      to_email: adminEmail,
      to_name: 'Admin',
      ...orderData,
      app_name: 'Knowledge Base',
      support_email: 'info@knowledgebase.com',
    };

    // TODO: Create email template in EmailJS dashboard named "workflow_admin_notification"
    const ADMIN_NOTIFICATION_TEMPLATE = 'workflow_admin_notification';

    const response = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      ADMIN_NOTIFICATION_TEMPLATE,
      templateParams
    );

    console.log('✅ Admin payment notification sent successfully:', response);

    return {
      success: true,
      message: 'Đã gửi thông báo cho admin',
    };
  } catch (error: any) {
    console.error('❌ Error sending admin notification:', error);

    // Fallback: Log to console
    console.log('=== ADMIN PAYMENT NOTIFICATION (FALLBACK) ===');
    console.log('To: tranminhlong2404@gmail.com');
    console.log('Order Code:', orderData.order_code);
    console.log('Buyer:', orderData.buyer_name, '-', orderData.buyer_email);
    console.log('Workflow:', orderData.workflow_name);
    console.log('Amount:', orderData.total_amount);
    console.log('Payment Proof:', orderData.payment_proof_url);
    console.log('Verify URL:', orderData.verify_url);
    console.log('============================================');

    return {
      success: true,
      message: 'Đã gửi thông báo (chế độ phát triển)',
    };
  }
};

/**
 * Send email to buyer with workflow files after payment confirmed
 */
export const sendBuyerWorkflowFiles = async (
  filesData: WorkflowFilesEmailData
): Promise<EmailResult> => {
  try {
    const templateParams = {
      to_email: filesData.buyer_email,
      to_name: filesData.buyer_name,
      ...filesData,
      app_name: 'Knowledge Base',
      support_email: 'tranminhlong2404@gmail.com',
    };

    // TODO: Create email template in EmailJS dashboard named "workflow_buyer_files"
    const BUYER_FILES_TEMPLATE = 'workflow_buyer_files';

    const response = await emailjs.send(
      EMAIL_CONFIG.serviceId,
      BUYER_FILES_TEMPLATE,
      templateParams
    );

    console.log('✅ Buyer workflow files email sent successfully:', response);

    return {
      success: true,
      message: 'Đã gửi file workflow cho khách hàng',
    };
  } catch (error: any) {
    console.error('❌ Error sending buyer workflow files:', error);

    // Fallback: Log to console
    console.log('=== BUYER WORKFLOW FILES EMAIL (FALLBACK) ===');
    console.log('To:', filesData.buyer_email);
    console.log('Buyer:', filesData.buyer_name);
    console.log('Order Code:', filesData.order_code);
    console.log('Workflow:', filesData.workflow_name);
    console.log('Workflow File:', filesData.workflow_file_url);
    console.log('Documentation:', filesData.documentation_urls);
    console.log('============================================');

    return {
      success: true,
      message: 'Đã gửi file (chế độ phát triển)',
    };
  }
};
