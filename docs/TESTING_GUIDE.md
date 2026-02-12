# 🧪 Knowledge Base - Testing Guide

## 📋 Tổng quan

Hướng dẫn test toàn bộ Backend Integration với Supabase.

## 🔧 Setup trước khi test

1. **Cài đặt dependencies**

   ```bash
   npm install
   ```

2. **Cấu hình environment**

   ```bash
   cp env.example .env
   # File .env đã có thông tin Supabase thực tế
   ```

3. **Chạy database schema (nếu chưa chạy)**
   - Vào Supabase Dashboard
   - SQL Editor
   - Chạy file `database/supabase-schema.sql`

## 🧪 Test Cases

### ✅ Test 1: Authentication

**Mục tiêu**: Test đăng ký, đăng nhập, đăng xuất

**Steps**:

1. Start server: `npm start`
2. Vào `/auth`
3. Đăng ký tài khoản mới
4. Kiểm tra email verification
5. Đăng nhập
6. Đăng xuất

**Expected Results**:

- ✅ Đăng ký thành công
- ✅ Email được gửi (check Supabase Auth logs)
- ✅ Đăng nhập thành công
- ✅ User profile được tạo trong database
- ✅ Đăng xuất thành công

### ✅ Test 2: Course Management

**Mục tiêu**: Test hiển thị courses từ database

**Steps**:

1. Vào `/khoa-hoc`
2. Kiểm tra danh sách courses
3. Click vào course để xem chi tiết
4. Test filter theo category

**Expected Results**:

- ✅ Courses hiển thị từ Supabase
- ✅ Course details load correctly
- ✅ Filter hoạt động
- ✅ Instructor info hiển thị

### ✅ Test 3: Blog System

**Mục tiêu**: Test blog posts từ database

**Steps**:

1. Vào `/blog`
2. Kiểm tra danh sách blog posts
3. Click vào post để xem chi tiết
4. Test related posts

**Expected Results**:

- ✅ Blog posts hiển thị từ Supabase
- ✅ Post content load correctly
- ✅ Author info hiển thị
- ✅ Related posts work

### ✅ Test 4: User Profile

**Mục tiêu**: Test user profile management

**Steps**:

1. Đăng nhập
2. Vào `/profile`
3. Cập nhật thông tin profile
4. Upload avatar
5. Kiểm tra thay đổi trong database

**Expected Results**:

- ✅ Profile info hiển thị đúng
- ✅ Update profile thành công
- ✅ Avatar upload hoạt động
- ✅ Changes reflect in database

### ✅ Test 5: Course Enrollment

**Mục tiêu**: Test enroll vào courses

**Steps**:

1. Đăng nhập
2. Vào course detail page
3. Click "Enroll"
4. Kiểm tra enrollment trong database
5. Vào "My Courses"

**Expected Results**:

- ✅ Enrollment thành công
- ✅ Record tạo trong user_courses table
- ✅ "My Courses" hiển thị enrolled courses

## 🔍 Debugging

### Check Supabase Connection

```javascript
// Trong browser console
import { supabase } from "./src/lib/supabase-config";

// Test connection
supabase.from("users").select("count").then(console.log);
```

### Check Database Tables

1. Vào Supabase Dashboard
2. Table Editor
3. Kiểm tra các tables: `users`, `courses`, `blog_posts`, `user_courses`

### Check Authentication

1. Vào Supabase Dashboard
2. Authentication > Users
3. Kiểm tra users đã đăng ký

### Check Storage

1. Vào Supabase Dashboard
2. Storage > user-avatars
3. Kiểm tra uploaded files

## 🐛 Common Issues

### Issue 1: "Invalid API key"

**Solution**: Kiểm tra .env file có đúng Supabase URL và key

### Issue 2: "RLS policy violation"

**Solution**: Kiểm tra user đã đăng nhập và RLS policies

### Issue 3: "Table doesn't exist"

**Solution**: Chạy lại database schema

### Issue 4: "Storage bucket not found"

**Solution**: Tạo bucket `user-avatars` trong Supabase

### Issue 5: CORS errors

**Solution**: Kiểm tra Site URL trong Supabase Auth settings

## 📊 Performance Testing

### Test Bundle Size

```bash
npm run build
# Kiểm tra build/static/js/main.*.js size
```

### Test Loading Times

1. Open DevTools > Network
2. Reload page
3. Check loading times for API calls

### Test Database Queries

```sql
-- Trong Supabase SQL Editor
EXPLAIN ANALYZE SELECT * FROM courses WHERE is_published = true;
```

## 🎯 Success Criteria

- [ ] Authentication hoạt động hoàn toàn
- [ ] Courses load từ database
- [ ] Blog posts load từ database
- [ ] User profile management hoạt động
- [ ] File upload hoạt động
- [ ] RLS policies bảo mật dữ liệu
- [ ] Performance tốt (< 2s load time)
- [ ] Error handling đầy đủ

## 📝 Test Results Template

```
Test Date: ___________
Tester: ___________

Authentication:
[ ] Sign up
[ ] Sign in
[ ] Sign out
[ ] Password reset

Courses:
[ ] Load courses
[ ] Course details
[ ] Filters
[ ] Enrollment

Blog:
[ ] Load posts
[ ] Post details
[ ] Related posts

Profile:
[ ] View profile
[ ] Update profile
[ ] Upload avatar

Performance:
[ ] Page load time: ___s
[ ] API response time: ___ms
[ ] Bundle size: ___KB

Issues Found:
1. ___________
2. ___________
3. ___________

Overall Status: ✅ PASS / ❌ FAIL
```

---

**Lưu ý**: Test trên cả desktop và mobile devices!
