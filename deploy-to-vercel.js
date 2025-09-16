#!/usr/bin/env node

/**
 * Deploy to Vercel Script
 * Tự động deploy dự án lên Vercel
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Nam Long Center - Deploy to Vercel');
console.log('=====================================');

// Kiểm tra Vercel CLI
try {
  execSync('vercel --version', { stdio: 'pipe' });
  console.log('✅ Vercel CLI đã được cài đặt');
} catch (error) {
  console.error('❌ Vercel CLI chưa được cài đặt. Đang cài đặt...');
  execSync('npm install -g vercel', { stdio: 'inherit' });
}

// Kiểm tra build
console.log('\n📦 Kiểm tra build...');
try {
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Build thành công!');
} catch (error) {
  console.error('❌ Build thất bại! Vui lòng kiểm tra lỗi.');
  process.exit(1);
}

// Tạo file .vercelignore nếu chưa có
const vercelIgnoreContent = `
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production
/build

# Misc
.DS_Store
.env.local
.env.development.local
.env.test.local
.env.production.local

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# nyc test coverage
.nyc_output

# Dependency directories
node_modules/
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
Thumbs.db
`;

if (!fs.existsSync('.vercelignore')) {
  fs.writeFileSync('.vercelignore', vercelIgnoreContent);
  console.log('✅ Đã tạo file .vercelignore');
}

// Tạo file vercel.json nếu chưa có
const vercelConfig = {
  "version": 2,
  "name": "nam-long-center",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/static/(.*)",
      "dest": "/static/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/index.html"
    }
  ],
  "env": {
    "REACT_APP_SUPABASE_URL": "@react_app_supabase_url",
    "REACT_APP_SUPABASE_ANON_KEY": "@react_app_supabase_anon_key",
    "REACT_APP_APP_URL": "@react_app_app_url"
  },
  "buildCommand": "npm run build",
  "outputDirectory": "build",
  "installCommand": "npm install",
  "framework": "create-react-app"
};

if (!fs.existsSync('vercel.json')) {
  fs.writeFileSync('vercel.json', JSON.stringify(vercelConfig, null, 2));
  console.log('✅ Đã tạo file vercel.json');
}

console.log('\n🌐 Bắt đầu deploy lên Vercel...');
console.log('📋 Hướng dẫn:');
console.log('1. Đăng nhập vào Vercel (nếu chưa)');
console.log('2. Chọn project hoặc tạo mới');
console.log('3. Cấu hình environment variables');
console.log('4. Deploy!');

console.log('\n🔧 Environment Variables cần thiết:');
console.log('REACT_APP_SUPABASE_URL = https://byidgbgvnrfhujprzzge.supabase.co');
console.log('REACT_APP_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5aWRnYmd2bnJmaHVqcHJ6emdlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MjQxMjAsImV4cCI6MjA1ODEwMDEyMH0.LJmu6PzY89Uc1K_5W-M7rsD18sWm-mHeMx1SeV4o_Dw');
console.log('REACT_APP_APP_URL = https://your-app-name.vercel.app');

console.log('\n🚀 Chạy lệnh sau để deploy:');
console.log('vercel --prod');

console.log('\n📚 Tài liệu tham khảo:');
console.log('- GitHub: https://github.com/Longtran2404/nam-long-center');
console.log('- Vercel Docs: https://vercel.com/docs');
console.log('- Supabase: https://supabase.com/dashboard/project/byidgbgvnrfhujprzzge');
