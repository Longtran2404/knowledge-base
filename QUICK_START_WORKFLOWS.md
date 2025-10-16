# 🚀 Quick Start - n8n Workflow Marketplace

## ⚡ 5 phút setup nhanh

### 1️⃣ Database (2 phút)
```sql
-- Vào Supabase SQL Editor, run 2 files:
database/workflow-marketplace.sql
database/workflow-images-update.sql
```

### 2️⃣ Storage Buckets (1 phút)
```
Supabase Dashboard → Storage → Create:
1. workflow-files (Private)
2. workflow-docs (Private)
3. payment-proofs (Public)
4. workflow-thumbnails (Public)
```

### 3️⃣ EmailJS (1 phút)
```
1. https://www.emailjs.com/ → Sign up
2. Connect Gmail
3. Create 2 templates (copy từ docs)
4. Get API keys
```

### 4️⃣ Environment (.env)
```bash
VITE_GEMINI_API_KEY=your_new_key
VITE_EMAILJS_SERVICE_ID=service_namlongcenter
VITE_EMAILJS_PUBLIC_KEY=your_key
```

### 5️⃣ Run
```bash
npm run dev
```

### 6️⃣ Test
```
✅ http://localhost:5173/workflows
✅ http://localhost:5173/admin/workflows
```

---

## 🎯 Main Routes

```
/workflows                      → Browse marketplace
/workflows/:slug                → Workflow details
/workflows/:slug/checkout       → QR payment
/admin/workflows                → Admin dashboard
  ├── Tab 1: My Workflows       → Manage workflows
  ├── Tab 2: Upload             → Create + AI image
  ├── Tab 3: Orders (admin)     → Verify payments
  └── Tab 4: Analytics          → Revenue stats
```

---

## 🎨 AI Image Generation

```typescript
// Trong Upload Workflow tab
1. Click "Tạo ảnh bằng AI" ✨
2. Select suggested prompt hoặc custom
3. Choose style: Modern/Minimal/Colorful
4. "Tạo ảnh" → Preview
5. "Sử dụng ảnh này" → Done!
```

---

## 💰 Revenue System

```
Admin Dashboard → Tab Analytics

📊 Revenue Stats Cards:
- Total Revenue
- Total Sales  
- Total Commission (20%)
- Average Order Value

🏆 Top Workflows:
- Rank badges (🥇🥈🥉)
- Revenue by workflow
- Animated progress bars

💵 Commission Breakdown (Partners):
- Revenue per workflow
- Commission rate
- Total earnings
```

---

## 📧 Email Flow

```
Buyer uploads payment proof
  ↓
Email to Admin: tranminhlong2404@gmail.com
  ↓
Admin clicks "Duyệt" in /admin/workflows?tab=orders
  ↓
Email to Buyer with download links
  ↓
Done! ✅
```

---

## 🎉 Ready to Sell!

```bash
# Deploy
vercel deploy

# Test production
https://your-app.vercel.app/workflows
```

---

**Need help?** Check [WORKFLOW_COMPLETE_GUIDE.md](WORKFLOW_COMPLETE_GUIDE.md)
