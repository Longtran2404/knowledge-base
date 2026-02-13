# 🚀 Hướng dẫn Nâng cấp Hệ thống CMS & Thanh toán

## Tổng quan

Nâng cấp này bao gồm:
1. ✅ Set tài khoản `tranminhlong2404@gmail.com` lên quyền **Admin toàn quyền**
2. ✅ Hệ thống thanh toán cá nhân (Bank Transfer, MoMo, ZaloPay, VNPay, PayPal)
3. ✅ CMS (Content Management System) - Sửa nội dung trang web không cần code
4. ✅ Audit log cho admin actions
5. ✅ 2 trang quản lý mới:
   - `/admin/cms` - Quản lý nội dung website
   - `/admin/payment-methods` - Quản lý phương thức thanh toán

---

## 📋 Bước 1: Chạy Migration Database

### Option A: Chạy trên Supabase Dashboard (Khuyến nghị)

1. Truy cập Supabase Dashboard: https://app.supabase.com
2. Chọn project của bạn
3. Vào **SQL Editor** (menu bên trái)
4. Click **New Query**
5. Copy toàn bộ nội dung file `supabase/migrations/upgrade_admin_and_cms.sql`
6. Paste vào SQL Editor
7. Click **Run** hoặc nhấn `Ctrl+Enter`
8. Kiểm tra kết quả - phải thấy "Success. No rows returned"

### Option B: Chạy bằng Supabase CLI

```bash
# Nếu chưa cài Supabase CLI
npm install -g supabase

# Login vào Supabase
supabase login

# Link project
supabase link --project-ref your-project-ref

# Chạy migration
supabase db push
```

---

## 🔑 Bước 2: Xác nhận quyền Admin

Sau khi chạy migration, tài khoản `tranminhlong2404@gmail.com` sẽ tự động được set quyền admin.

**Lưu ý:** Nếu email này chưa được đăng ký, bạn cần:
1. Đăng ký tài khoản với email `tranminhlong2404@gmail.com`
2. Chạy lại câu SQL sau trong Supabase SQL Editor:

```sql
UPDATE nlc_accounts
SET account_role = 'admin', updated_at = NOW()
WHERE email = 'tranminhlong2404@gmail.com';
```

---

## 🎨 Bước 3: Truy cập trang quản lý

### 1. Admin CMS - Quản lý nội dung
**URL:** `/admin/cms`

**Chức năng:**
- Tạo/sửa/xóa nội dung động cho các trang
- Quản lý theo cấu trúc: `page_key > section_key > content_key`
- Hỗ trợ nhiều loại nội dung: text, HTML, markdown, image_url, JSON
- Filter theo page và section
- Tìm kiếm nội dung

**Cấu trúc dữ liệu:**
```
page_key: home, about, contact, global
section_key: hero, features, footer, info
content_key: title, subtitle, description, button_text
```

**Ví dụ sử dụng:**
- Sửa tiêu đề trang chủ: `home > hero > title`
- Sửa email liên hệ: `contact > info > email`
- Sửa footer: `global > footer > copyright`

### 2. Payment Methods - Quản lý thanh toán
**URL:** `/admin/payment-methods`

**Chức năng:**
- Thêm/sửa/xóa tài khoản thanh toán
- Hỗ trợ: Bank Transfer, MoMo, ZaloPay, VNPay, PayPal
- Upload QR code
- Thêm hướng dẫn thanh toán
- Bật/tắt từng phương thức
- Sắp xếp thứ tự hiển thị

**Thông tin cần nhập:**
- Loại phương thức (bank_transfer, momo, zalopay, vnpay, paypal)
- Tên hiển thị
- Tên tài khoản
- Số tài khoản/số điện thoại
- Tên ngân hàng (nếu là bank transfer)
- URL mã QR (optional)
- Hướng dẫn thanh toán

---

## 💻 Bước 4: Sử dụng CMS trong code

### Hook: `usePageContent`

```tsx
import { usePageContent } from '../hooks/useSiteContent';

function HomePage() {
  const { content, loading, getContent } = usePageContent('home');

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>{getContent('hero', 'title', 'Default Title')}</h1>
      <p>{getContent('hero', 'subtitle', 'Default Subtitle')}</p>
      <button>{getContent('hero', 'cta_primary_text', 'Learn More')}</button>
    </div>
  );
}
```

### Hook: `useSectionContent`

```tsx
import { useSectionContent } from '../hooks/useSiteContent';

function HeroSection() {
  const { getContent, getContentMap } = useSectionContent('home', 'hero');

  const title = getContent('title', 'Welcome');
  const subtitle = getContent('subtitle', 'Learn more about us');

  // Or get all as a map
  const contentMap = getContentMap();
  // { title: '...', subtitle: '...', description: '...' }

  return (
    <div>
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </div>
  );
}
```

### API Usage

```tsx
import { siteContentApi } from '../lib/api/cms-api';

// Get all content for a page
const content = await siteContentApi.getPageContent('home');

// Get specific section
const heroContent = await siteContentApi.getContentByPageAndSection('home', 'hero');

// Get single item
const title = await siteContentApi.getContentItem('home', 'hero', 'title');

// Update content (admin only)
await siteContentApi.updateSiteContent({
  id: 'content-id',
  content_value: 'New value',
});
```

---

## 🎯 Bước 5: Tích hợp Payment Methods

### Hiển thị phương thức thanh toán cho user

```tsx
import { paymentMethodsApi } from '../lib/api/cms-api';

function CheckoutPage() {
  const [methods, setMethods] = useState([]);

  useEffect(() => {
    loadMethods();
  }, []);

  const loadMethods = async () => {
    const data = await paymentMethodsApi.getActivePaymentMethods();
    setMethods(data);
  };

  return (
    <div>
      {methods.map(method => (
        <div key={method.id}>
          <h3>{method.method_name}</h3>
          <p>Tài khoản: {method.account_holder}</p>
          <p>Số TK: {method.account_number}</p>
          {method.bank_name && <p>Ngân hàng: {method.bank_name}</p>}
          {method.qr_code_url && <img src={method.qr_code_url} alt="QR Code" />}
          <p>{method.instructions}</p>
        </div>
      ))}
    </div>
  );
}
```

---

## 📊 Database Schema

### nlc_payment_methods
```sql
- id (UUID, PK)
- method_type (VARCHAR: bank_transfer, momo, zalopay, vnpay, paypal)
- method_name (VARCHAR)
- account_holder (VARCHAR)
- account_number (VARCHAR)
- bank_name (VARCHAR, nullable)
- qr_code_url (TEXT, nullable)
- instructions (TEXT, nullable)
- is_active (BOOLEAN)
- display_order (INTEGER)
- created_at, updated_at (TIMESTAMP)
```

### nlc_site_content
```sql
- id (UUID, PK)
- page_key (VARCHAR: home, about, contact, global)
- section_key (VARCHAR: hero, features, footer, info)
- content_key (VARCHAR: title, subtitle, description)
- content_value (TEXT)
- content_type (VARCHAR: text, html, markdown, image_url, json)
- metadata (JSONB, nullable)
- is_active (BOOLEAN)
- display_order (INTEGER)
- created_by, updated_by (UUID FK to auth.users)
- created_at, updated_at (TIMESTAMP)
- UNIQUE(page_key, section_key, content_key)
```

### nlc_admin_audit_log
```sql
- id (UUID, PK)
- admin_user_id (UUID FK to auth.users)
- action_type (VARCHAR: create, update, delete, approve, reject)
- resource_type (VARCHAR: workflow, course, payment_method, site_content, user)
- resource_id (UUID, nullable)
- old_value, new_value (JSONB)
- ip_address (INET)
- user_agent (TEXT)
- created_at (TIMESTAMP)
```

---

## 🚀 Bước 6: Deploy

### Deploy lên Vercel

```bash
# Build locally first to test
npm run build

# Deploy to Vercel
vercel --prod
```

### Hoặc push lên Git và Vercel tự deploy

```bash
git add .
git commit -m "feat: Add CMS & Payment Management System"
git push origin main
```

---

## ✅ Checklist sau khi deploy

- [ ] Truy cập `/admin/cms` và kiểm tra quyền admin
- [ ] Tạo một vài content mẫu
- [ ] Truy cập `/admin/payment-methods` và thêm tài khoản thanh toán
- [ ] Kiểm tra trang checkout có hiển thị payment methods chưa
- [ ] Test audit log trong Supabase Dashboard
- [ ] Kiểm tra RLS policies hoạt động đúng

---

## 🔒 Security Notes

1. **RLS Policies đã được thiết lập:**
   - Public có thể xem active content
   - Chỉ admin mới được create/update/delete
   - Audit logs chỉ admin xem được

2. **Admin role:**
   - Chỉ account có `account_role = 'admin'` mới truy cập được
   - Email `tranminhlong2404@gmail.com` đã được set admin mặc định

3. **Audit logging:**
   - Mọi thay đổi của admin đều được log
   - Trigger tự động ghi log khi CRUD

---

## 📝 Default Content đã được tạo

Migration tự động tạo nội dung mặc định cho:
- Home page (hero section, features)
- Contact page (email, phone, address)
- Global footer (copyright, company name)

Bạn có thể sửa trực tiếp trong `/admin/cms`

---

## 🆘 Troubleshooting

### Migration failed?
- Check Supabase logs
- Ensure tables don't exist yet
- Try running parts of migration separately

### Can't access admin pages?
- Confirm email `tranminhlong2404@gmail.com` is registered
- Check `nlc_accounts` table: `account_role = 'admin'`
- Clear browser cache and re-login

### Content not showing?
- Check `is_active = true` in database
- Verify RLS policies are enabled
- Check browser console for API errors

### Payment methods not showing?
- Ensure `is_active = true`
- Check `display_order` for sorting
- Verify user has proper permissions

---

## 📞 Support

Nếu gặp vấn đề, check:
1. Supabase logs
2. Browser console
3. Network tab trong DevTools
4. Database tables and RLS policies

---

**✨ Happy CMS Management! ✨**
