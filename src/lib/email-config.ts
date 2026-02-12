// EmailJS Configuration
export const EMAIL_CONFIG = {
  // EmailJS Service ID - Lấy từ environment variables
  serviceId:
    process.env.REACT_APP_EMAILJS_SERVICE_ID || "service_knowledgebase",

  // EmailJS Template ID - Lấy từ environment variables
  templateId:
    process.env.REACT_APP_EMAILJS_TEMPLATE_ID || "template_verification",

  // EmailJS Public Key - Lấy từ environment variables
  publicKey:
    process.env.REACT_APP_EMAILJS_PUBLIC_KEY || "your_emailjs_public_key",

  // Email gửi từ
  fromEmail: "noreply@knowledgebase.com",
  fromName: "Knowledge Base",

  // URL ứng dụng
  appUrl: process.env.REACT_APP_URL || "http://localhost:3000",
};

// Email templates
export const EMAIL_TEMPLATES = {
  verification: {
    subject: "Xác thực tài khoản Knowledge Base",
    template: "verification",
  },
  passwordReset: {
    subject: "Đặt lại mật khẩu Knowledge Base",
    template: "password_reset",
  },
  welcome: {
    subject: "Chào mừng đến với Knowledge Base",
    template: "welcome",
  },
};
