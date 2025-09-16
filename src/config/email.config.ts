// Email Configuration
export const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: parseInt(process.env.EMAIL_PORT || "587"),
  secure: process.env.EMAIL_SECURE === "true",
  auth: {
    user: process.env.EMAIL_USER || "your-email@gmail.com",
    pass: process.env.EMAIL_PASS || "your-app-password",
  },
};

// JWT Configuration
export const JWT_CONFIG = {
  secret:
    process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production",
  refreshSecret:
    process.env.JWT_REFRESH_SECRET ||
    "your-super-secret-refresh-key-change-in-production",
  expiresIn: "7d",
  refreshExpiresIn: "30d",
};

// App Configuration
export const APP_CONFIG = {
  url: process.env.REACT_APP_APP_URL || "http://localhost:3000",
  name: "Nam Long Center",
  supportEmail: "info@namlongcenter.com",
  supportPhone: "0123 456 789",
};
