import nodemailer from "nodemailer";
import { supabase } from "./supabase";

// Email configuration
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASS || "your-app-password",
  },
};

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport(EMAIL_CONFIG);
};

// Email templates
export const EMAIL_TEMPLATES = {
  "email-verification": {
    subject: "Xác thực tài khoản Nam Long Center",
    html: (data: any) => `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Xác thực tài khoản</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #2563eb;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #666;
            font-size: 16px;
          }
          .content {
            margin-bottom: 30px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #2d3748;
          }
          .message {
            font-size: 16px;
            margin-bottom: 25px;
            line-height: 1.8;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #2563eb, #1d4ed8);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: all 0.3s ease;
          }
          .button:hover {
            background: linear-gradient(135deg, #1d4ed8, #1e40af);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
          }
          .alternative {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #2563eb;
          }
          .alternative-text {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
          }
          .alternative-link {
            word-break: break-all;
            color: #2563eb;
            text-decoration: none;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 14px;
          }
          .social-links {
            margin: 20px 0;
          }
          .social-links a {
            color: #2563eb;
            text-decoration: none;
            margin: 0 10px;
          }
          .warning {
            background: #fef3cd;
            border: 1px solid #fde68a;
            color: #92400e;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Nam Long Center</div>
            <div class="subtitle">Trung tâm đào tạo và phát triển kỹ năng</div>
          </div>
          
          <div class="content">
            <div class="greeting">Xin chào ${data.fullName}!</div>
            
            <div class="message">
              Cảm ơn bạn đã đăng ký tài khoản tại <strong>Nam Long Center</strong>. 
              Để hoàn tất quá trình đăng ký và bắt đầu sử dụng các dịch vụ của chúng tôi, 
              vui lòng xác thực địa chỉ email của bạn.
            </div>
            
            <div style="text-align: center;">
              <a href="${data.verificationUrl}" class="button">
                Xác thực tài khoản ngay
              </a>
            </div>
            
            <div class="alternative">
              <div class="alternative-text">
                Nếu nút trên không hoạt động, bạn có thể sao chép và dán liên kết sau vào trình duyệt:
              </div>
              <a href="${data.verificationUrl}" class="alternative-link">
                ${data.verificationUrl}
              </a>
            </div>
            
            <div class="warning">
              <strong>Lưu ý:</strong> Liên kết xác thực sẽ hết hạn sau 24 giờ. 
              Nếu bạn không xác thực trong thời gian này, vui lòng đăng ký lại.
            </div>
          </div>
          
          <div class="footer">
            <div class="social-links">
              <a href="#">Facebook</a> |
              <a href="#">Instagram</a> |
              <a href="#">LinkedIn</a>
            </div>
            <p>
              <strong>Nam Long Center</strong><br>
              Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM<br>
              Email: info@namlongcenter.com | Hotline: 0123 456 789
            </p>
            <p style="font-size: 12px; color: #999;">
              Email này được gửi tự động, vui lòng không trả lời. 
              Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  "password-reset": {
    subject: "Đặt lại mật khẩu - Nam Long Center",
    html: (data: any) => `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Đặt lại mật khẩu</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #dc2626;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #666;
            font-size: 16px;
          }
          .content {
            margin-bottom: 30px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #2d3748;
          }
          .message {
            font-size: 16px;
            margin-bottom: 25px;
            line-height: 1.8;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #dc2626, #b91c1c);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: all 0.3s ease;
          }
          .button:hover {
            background: linear-gradient(135deg, #b91c1c, #991b1b);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
          }
          .alternative {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            border-left: 4px solid #dc2626;
          }
          .alternative-text {
            font-size: 14px;
            color: #666;
            margin-bottom: 10px;
          }
          .alternative-link {
            word-break: break-all;
            color: #dc2626;
            text-decoration: none;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 14px;
          }
          .warning {
            background: #fef3cd;
            border: 1px solid #fde68a;
            color: #92400e;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 14px;
          }
          .security-tips {
            background: #e0f2fe;
            border: 1px solid #81d4fa;
            color: #0277bd;
            padding: 15px;
            border-radius: 8px;
            margin: 20px 0;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Nam Long Center</div>
            <div class="subtitle">Yêu cầu đặt lại mật khẩu</div>
          </div>
          
          <div class="content">
            <div class="greeting">Xin chào ${data.fullName}!</div>
            
            <div class="message">
              Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn tại 
              <strong>Nam Long Center</strong>. Nếu bạn đã yêu cầu điều này, 
              vui lòng nhấn vào nút bên dưới để đặt lại mật khẩu.
            </div>
            
            <div style="text-align: center;">
              <a href="${data.resetUrl}" class="button">
                Đặt lại mật khẩu
              </a>
            </div>
            
            <div class="alternative">
              <div class="alternative-text">
                Nếu nút trên không hoạt động, bạn có thể sao chép và dán liên kết sau vào trình duyệt:
              </div>
              <a href="${data.resetUrl}" class="alternative-link">
                ${data.resetUrl}
              </a>
            </div>
            
            <div class="warning">
              <strong>Lưu ý quan trọng:</strong> Liên kết đặt lại mật khẩu sẽ hết hạn sau 1 giờ. 
              Nếu bạn không sử dụng liên kết trong thời gian này, vui lòng yêu cầu đặt lại mật khẩu mới.
            </div>
            
            <div class="security-tips">
              <strong>Mẹo bảo mật:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>Sử dụng mật khẩu mạnh với ít nhất 8 ký tự</li>
                <li>Kết hợp chữ hoa, chữ thường, số và ký tự đặc biệt</li>
                <li>Không sử dụng thông tin cá nhân trong mật khẩu</li>
                <li>Không chia sẻ mật khẩu với bất kỳ ai</li>
              </ul>
            </div>
          </div>
          
          <div class="footer">
            <p>
              <strong>Nam Long Center</strong><br>
              Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM<br>
              Email: info@namlongcenter.com | Hotline: 0123 456 789
            </p>
            <p style="font-size: 12px; color: #999;">
              Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này. 
              Tài khoản của bạn vẫn an toàn.
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  },

  welcome: {
    subject: "Chào mừng đến với Nam Long Center!",
    html: (data: any) => `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Chào mừng</title>
        <style>
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f4f4f4;
          }
          .container {
            background: white;
            border-radius: 10px;
            padding: 30px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #e0e0e0;
          }
          .logo {
            font-size: 28px;
            font-weight: bold;
            color: #059669;
            margin-bottom: 10px;
          }
          .subtitle {
            color: #666;
            font-size: 16px;
          }
          .content {
            margin-bottom: 30px;
          }
          .greeting {
            font-size: 18px;
            margin-bottom: 20px;
            color: #2d3748;
          }
          .message {
            font-size: 16px;
            margin-bottom: 25px;
            line-height: 1.8;
          }
          .button {
            display: inline-block;
            background: linear-gradient(135deg, #059669, #047857);
            color: white;
            padding: 15px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: bold;
            font-size: 16px;
            text-align: center;
            margin: 20px 0;
            transition: all 0.3s ease;
          }
          .button:hover {
            background: linear-gradient(135deg, #047857, #065f46);
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
          }
          .features {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
          }
          .features h3 {
            color: #059669;
            margin-top: 0;
          }
          .features ul {
            margin: 10px 0;
            padding-left: 20px;
          }
          .features li {
            margin-bottom: 8px;
          }
          .footer {
            text-align: center;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #e0e0e0;
            color: #666;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">Nam Long Center</div>
            <div class="subtitle">Chào mừng bạn đến với cộng đồng của chúng tôi!</div>
          </div>
          
          <div class="content">
            <div class="greeting">Xin chào ${data.fullName}!</div>
            
            <div class="message">
              Chúc mừng! Tài khoản của bạn đã được xác thực thành công. 
              Bây giờ bạn có thể truy cập đầy đủ các tính năng và dịch vụ của 
              <strong>Nam Long Center</strong>.
            </div>
            
            <div class="features">
              <h3>🎉 Những gì bạn có thể làm ngay bây giờ:</h3>
              <ul>
                <li>Khám phá các khóa học chất lượng cao</li>
                <li>Tham gia cộng đồng học viên</li>
                <li>Theo dõi tiến độ học tập</li>
                <li>Truy cập tài liệu và tài nguyên độc quyền</li>
                <li>Nhận chứng chỉ sau khi hoàn thành khóa học</li>
                <li>Tham gia các sự kiện và workshop</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${
                process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
              }" class="button">
                Bắt đầu khám phá
              </a>
            </div>
          </div>
          
          <div class="footer">
            <p>
              <strong>Nam Long Center</strong><br>
              Địa chỉ: 123 Đường ABC, Quận XYZ, TP.HCM<br>
              Email: info@namlongcenter.com | Hotline: 0123 456 789
            </p>
            <p style="font-size: 12px; color: #999;">
              Cảm ơn bạn đã tin tưởng và lựa chọn Nam Long Center!
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
  },
};

// Email service interface
export interface EmailData {
  to: string;
  subject: string;
  template: keyof typeof EMAIL_TEMPLATES;
  data: any;
}

// Send email function
export const sendEmail = async (emailData: EmailData): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    const template = EMAIL_TEMPLATES[emailData.template];

    if (!template) {
      throw new Error(`Template ${emailData.template} not found`);
    }

    const mailOptions = {
      from: `"Nam Long Center" <${EMAIL_CONFIG.auth.user}>`,
      to: emailData.to,
      subject: emailData.subject,
      html: template.html(emailData.data),
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log("Email sent:", info.messageId);

    // Update email log status
    await supabase
      .from("email_logs")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
      })
      .eq("to_email", emailData.to)
      .eq("subject", emailData.subject)
      .eq("status", "pending");

    return true;
  } catch (error: any) {
    console.error("Send email error:", error);

    // Update email log with error
    await supabase
      .from("email_logs")
      .update({
        status: "failed",
        error_message: error.message,
      })
      .eq("to_email", emailData.to)
      .eq("subject", emailData.subject)
      .eq("status", "pending");

    return false;
  }
};

// Send verification email
export const sendVerificationEmail = async (
  email: string,
  fullName: string,
  token: string
): Promise<boolean> => {
  const verificationUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/verify-email?token=${token}`;

  const emailData: EmailData = {
    to: email,
    subject: "Xác thực tài khoản Nam Long Center",
    template: "email-verification",
    data: {
      fullName,
      verificationUrl,
      token,
    },
  };

  return await sendEmail(emailData);
};

// Send password reset email
export const sendPasswordResetEmail = async (
  email: string,
  fullName: string,
  token: string
): Promise<boolean> => {
  const resetUrl = `${
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  }/reset-password?token=${token}`;

  const emailData: EmailData = {
    to: email,
    subject: "Đặt lại mật khẩu - Nam Long Center",
    template: "password-reset",
    data: {
      fullName,
      resetUrl,
      token,
    },
  };

  return await sendEmail(emailData);
};

// Send welcome email
export const sendWelcomeEmail = async (
  email: string,
  fullName: string
): Promise<boolean> => {
  const emailData: EmailData = {
    to: email,
    subject: "Chào mừng đến với Nam Long Center!",
    template: "welcome",
    data: {
      fullName,
    },
  };

  return await sendEmail(emailData);
};

// Test email configuration
export const testEmailConfiguration = async (): Promise<boolean> => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("Email configuration is valid");
    return true;
  } catch (error: any) {
    console.error("Email configuration error:", error);
    return false;
  }
};

// Get email logs
export const getEmailLogs = async (limit: number = 50) => {
  try {
    const { data, error } = await supabase
      .from("email_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error("Get email logs error:", error);
    return [];
  }
};

// Retry failed emails
export const retryFailedEmails = async (): Promise<number> => {
  try {
    const { data: failedEmails, error } = await supabase
      .from("email_logs")
      .select("*")
      .eq("status", "failed")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    let retryCount = 0;
    for (const emailLog of failedEmails || []) {
      try {
        // Parse the original email data from the log
        const emailData: EmailData = {
          to: emailLog.to_email,
          subject: emailLog.subject,
          template: emailLog.template_name as keyof typeof EMAIL_TEMPLATES,
          data: {}, // You might want to store this in the log for retry
        };

        const success = await sendEmail(emailData);
        if (success) {
          retryCount++;
        }
      } catch (error) {
        console.error(`Failed to retry email to ${emailLog.to_email}:`, error);
      }
    }

    return retryCount;
  } catch (error: any) {
    console.error("Retry failed emails error:", error);
    return 0;
  }
};
