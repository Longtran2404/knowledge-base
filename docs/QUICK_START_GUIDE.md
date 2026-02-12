# 🚀 Quick Start Guide - Knowledge Base

## Mục tiêu tiếp theo: Đạt 10/10

Dự án đã được cải thiện lên **8.5/10**. Đây là roadmap chi tiết để đạt **10/10** trong 8-10 tuần.

---

## 📊 Tình Trạng Hiện Tại

### ✅ Đã Hoàn Thành (Phase 1)
- [x] **Type Safety**: Loại bỏ `as any`, type-safe operations
- [x] **Error Handling**: Centralized với AppError & ErrorHandler
- [x] **Logging System**: Structured logging với logger service
- [x] **Security Headers**: CSP, HSTS, X-Frame-Options (vercel.json)
- [x] **Health Check**: /api/health endpoint
- [x] **CI/CD Pipeline**: GitHub Actions workflow
- [x] **Pre-commit Hooks**: Husky + commitlint
- [x] **Refund Manager**: Complete refund flow implementation
- [x] **VNPay IP Fix**: Dynamic client IP fetching

### 🔧 Đang Làm (Phase 2)
- [ ] Deploy database schema
- [ ] Enable all database APIs
- [ ] Write comprehensive tests (target >70%)
- [ ] Setup Sentry monitoring
- [ ] Implement 2FA

### 📋 Kế Hoạch Tiếp Theo (Phase 3-4)
- [ ] File upload security (virus scan)
- [ ] Performance optimization (bundle <500KB)
- [ ] CDN setup
- [ ] Production deployment

---

## 🎯 Action Items - Ưu Tiên Cao

### 1. Deploy Database (P0 - DO NOW) ⚡

**Thời gian:** 1-2 giờ

```bash
# Step 1: Mở Supabase Dashboard
# URL: https://supabase.com/dashboard

# Step 2: Chọn project → SQL Editor

# Step 3: Copy toàn bộ nội dung từ
cat database/setup.sql

# Step 4: Paste vào SQL Editor và Run

# Step 5: Verify tables được tạo
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'nlc_%';

# Expected output:
# - nlc_accounts
# - nlc_courses
# - nlc_enrollments
# - nlc_managers
# - nlc_user_approvals
# - nlc_notifications
# - nlc_activity_log
```

**Kết quả mong đợi:**
- ✅ 7 tables được tạo thành công
- ✅ Triggers hoạt động (updated_at auto-update)
- ✅ Sample data có sẵn (admin account, 3 courses)

---

### 2. Enable Database APIs (P0 - CRITICAL) 🔧

**Thời gian:** 2-3 giờ

**Files cần sửa:**

#### A. `src/lib/api/nlc-database-api.ts`

Tìm và uncomment tất cả:
```typescript
// ❌ BEFORE:
// TODO: Enable after database setup
return { success: false, error: "Database not set up" };

// ✅ AFTER:
const { data, error } = await supabase
  .from('nlc_accounts')
  .insert(accountData)
  .select()
  .single();

if (error) {
  throw ErrorHandler.handleSupabaseError(error);
}

return { success: true, data };
```

#### B. `src/contexts/UnifiedAuthContext.tsx`

Lines 245-258: Uncomment account creation:
```typescript
// ✅ Enable this:
try {
  await supabase.from('nlc_accounts').insert([{
    user_id: userId,
    email: userEmail || "",
    full_name: userFullName || userEmail?.split("@")[0] || "User",
    account_role: "sinh_vien",
    membership_plan: "free",
    account_status: "active",
    is_paid: false,
    is_verified: false,
    auth_provider: "email",
    login_count: 0,
  }]);
  logger.info("Account created in nlc_accounts");
} catch (createError) {
  logger.error("Could not create account record", createError);
}
```

Lines 275-286: Uncomment login tracking:
```typescript
// ✅ Enable this:
await supabase
  .from('nlc_accounts')
  .update({
    last_login_at: new Date().toISOString(),
    login_count: (account.login_count || 0) + 1,
  })
  .eq('user_id', userId);
```

**Test:**
```bash
npm start
# 1. Đăng ký user mới
# 2. Check Supabase → nlc_accounts table
# 3. Verify user được tạo
```

---

### 3. Setup Sentry Monitoring (P1) 📊

**Thời gian:** 1 giờ

```bash
# Install Sentry
npm install @sentry/react @sentry/tracing

# Get DSN from https://sentry.io
# Add to .env.local:
REACT_APP_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
```

**Update `src/index.tsx`:**
```typescript
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

Sentry.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [new BrowserTracing()],
  tracesSampleRate: 1.0,
});

// Wrap App
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
  <Sentry.ErrorBoundary fallback={<ErrorFallback />}>
    <App />
  </Sentry.ErrorBoundary>
);
```

---

### 4. Write Tests (P0 - CRITICAL) 🧪

**Target: >70% coverage**

**Week 1: Unit Tests**

```bash
# Create test file
touch src/lib/auth-service.test.ts
```

```typescript
// src/lib/auth-service.test.ts
import { authService } from './auth-service';
import { supabase } from './supabase-config';

jest.mock('./supabase-config');

describe('AuthService', () => {
  describe('signUp', () => {
    it('should create user with valid email', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
      };

      (supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      });

      const result = await authService.signUp(
        'test@example.com',
        'Password123!',
        'Test User'
      );

      expect(result.success).toBe(true);
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123!',
        options: {
          data: {
            full_name: 'Test User',
          },
        },
      });
    });

    it('should reject weak passwords', async () => {
      const result = await authService.signUp(
        'test@example.com',
        '123', // Weak password
        'Test User'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('password');
    });
  });

  describe('signIn', () => {
    it('should login with correct credentials', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { user: { id: 'user-123' } },
        error: null,
      });

      const result = await authService.signIn(
        'test@example.com',
        'Password123!'
      );

      expect(result.success).toBe(true);
    });

    it('should handle wrong password', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: null,
        error: { message: 'Invalid credentials' },
      });

      const result = await authService.signIn(
        'test@example.com',
        'wrongpassword'
      );

      expect(result.success).toBe(false);
      expect(result.error).toContain('credentials');
    });
  });
});
```

**Run tests:**
```bash
npm test -- --coverage
```

---

### 5. Environment Variables (P0) 🔐

**Create `.env.local`:**
```env
# Supabase
REACT_APP_SUPABASE_URL=https://xxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Stripe
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_xxx

# VNPay
REACT_APP_VNPAY_TMN_CODE=xxx
REACT_APP_VNPAY_HASH_SECRET=xxx
REACT_APP_VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

# Sentry
REACT_APP_SENTRY_DSN=https://xxx@sentry.io/xxx

# Analytics (optional)
REACT_APP_MIXPANEL_TOKEN=xxx
REACT_APP_GA_TRACKING_ID=G-xxx

# Feature Flags
REACT_APP_FEATURE_2FA=true
REACT_APP_FEATURE_FILE_SCAN=false
```

**Update `.env.example`:**
```bash
cp .env.local .env.example
# Remove actual values, keep keys only
```

---

## 📈 Progress Tracking

### Phase 1: Foundation ✅ (Completed)
- [x] Type safety improvements
- [x] Error handling system
- [x] Logging infrastructure
- [x] Security headers
- [x] CI/CD pipeline
- [x] Refund flow

### Phase 2: Database & Testing 🔄 (In Progress)
- [ ] Database deployment
- [ ] API enablement
- [ ] Test coverage >70%
- [ ] Monitoring setup

### Phase 3: Features & Security 📅 (Planned)
- [ ] 2FA implementation
- [ ] File security
- [ ] Performance optimization

### Phase 4: Production 🚀 (Week 9-10)
- [ ] Final testing
- [ ] Documentation
- [ ] Deployment

---

## 🎯 Daily Workflow

```bash
# Morning
git pull origin main
npm install
npm test -- --watch &

# Pick a task from roadmap
git checkout -b feature/task-name

# Write test first (TDD)
npm test -- auth-service.test.ts

# Implement feature
# ...

# Commit with conventional format
git add .
git commit -m "feat: add user authentication tests"
# Husky will:
# - Run linter
# - Run type check
# - Run related tests
# - Validate commit message

# Push and create PR
git push origin feature/task-name
gh pr create --title "feat: add auth tests" --body "Closes #123"

# CI/CD will:
# - Run all tests
# - Check coverage
# - Build app
# - Deploy if main branch
```

---

## 🔍 Debugging Tips

### Check Database Connection
```bash
npm run test:db
# Or manually:
node scripts/test-database-connection.js
```

### Check API Health
```bash
curl http://localhost:3000/api/health
# Should return:
# {
#   "status": "ok",
#   "database": "connected",
#   "timestamp": "2025-..."
# }
```

### Check Test Coverage
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

### Monitor Errors (Sentry)
```bash
# Development
logger.error("Test error", new Error("Testing Sentry"));

# Check Sentry Dashboard
# https://sentry.io/organizations/xxx/issues/
```

---

## 📚 Resources

### Documentation
- [ROADMAP_TO_10.md](./ROADMAP_TO_10.md) - Complete roadmap
- [IMPROVEMENTS_SUMMARY.md](./IMPROVEMENTS_SUMMARY.md) - What's done
- [DATABASE_SETUP.md](./DATABASE_SETUP.md) - Database guide

### Tools & Dashboards
- **Supabase**: https://supabase.com/dashboard
- **Vercel**: https://vercel.com/dashboard
- **Sentry**: https://sentry.io
- **GitHub Actions**: https://github.com/your-repo/actions

### Testing Guides
- [React Testing Library](https://testing-library.com/react)
- [Playwright](https://playwright.dev)
- [Jest](https://jestjs.io)

---

## 🚨 Common Issues & Solutions

### Issue: Database APIs return 406/400
**Solution:** Database chưa deploy
```bash
# Deploy database/setup.sql to Supabase
```

### Issue: Tests fail with "Cannot find module"
**Solution:**
```bash
npm ci  # Clean install
npm test
```

### Issue: Commit rejected by Husky
**Solution:**
```bash
# Fix linter errors
npm run lint

# Fix commit message format
git commit -m "feat: add feature X"  # ✅
# Not: "added feature X"  # ❌
```

### Issue: Build fails on Vercel
**Solution:** Check environment variables
```bash
# Vercel Dashboard → Settings → Environment Variables
# Add all REACT_APP_* variables
```

---

## 🎉 Next Milestones

1. **Week 1-2**: Database + APIs operational
2. **Week 3-5**: Test coverage >70%
3. **Week 6-8**: All features complete
4. **Week 9-10**: Production ready → 10/10! 🚀

---

**Start here:** Deploy database now!
```bash
# 1. Open https://supabase.com/dashboard
# 2. Go to SQL Editor
# 3. Run database/setup.sql
# 4. Uncomment API calls in code
# 5. npm start
# 6. Test signup/login
```

Let's achieve 10/10! 💪