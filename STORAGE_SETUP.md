# 📦 Supabase Storage Setup Guide

## Bước 1: Tạo Storage Buckets

1. **Vào Supabase Dashboard**: https://supabase.com/dashboard
2. Chọn project **byidgbgvnrfhujprzzge**
3. Menu **Storage** → Click **New bucket**

### Tạo các buckets sau:

#### 1. **workflows** (Public)
- Name: `workflows`
- Public bucket: ✅ Yes
- Allowed MIME types: `application/json`
- Max file size: 10MB
- Purpose: Lưu n8n workflow JSON files

#### 2. **videos** (Private)
- Name: `videos`
- Public bucket: ❌ No (Private)
- Allowed MIME types: `video/*`
- Max file size: 500MB
- Purpose: Video bài học, khóa học

#### 3. **documents** (Public)
- Name: `documents`
- Public bucket: ✅ Yes
- Allowed MIME types: `application/pdf, application/msword, application/vnd.*`
- Max file size: 50MB
- Purpose: Tài liệu, PDF

#### 4. **images** (Public)
- Name: `images`
- Public bucket: ✅ Yes
- Allowed MIME types: `image/*`
- Max file size: 10MB
- Purpose: Thumbnail, hình ảnh

---

## Bước 2: Cấu hình Storage Policies

Sau khi tạo bucket, set policies:

### **workflows bucket**

```sql
-- Allow authenticated users to upload
CREATE POLICY "Users can upload workflows"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'workflows');

-- Allow authenticated users to read
CREATE POLICY "Users can read workflows"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'workflows');

-- Allow users to update their own files
CREATE POLICY "Users can update own workflows"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'workflows' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to delete their own files
CREATE POLICY "Users can delete own workflows"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'workflows' AND auth.uid()::text = (storage.foldername(name))[1]);
```

### **videos bucket**

```sql
-- Allow authenticated users to upload videos
CREATE POLICY "Users can upload videos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'videos');

-- Allow authenticated users to view videos (protected)
CREATE POLICY "Users can view videos"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'videos');

-- Admin can delete videos
CREATE POLICY "Admins can delete videos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'videos' AND
  EXISTS (
    SELECT 1 FROM public.nlc_accounts
    WHERE nlc_accounts.user_id = auth.uid()
    AND nlc_accounts.account_role = 'admin'
  )
);
```

### **documents bucket**

```sql
-- Public read access
CREATE POLICY "Public can read documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

-- Authenticated users can upload
CREATE POLICY "Users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'documents');
```

### **images bucket**

```sql
-- Public read access
CREATE POLICY "Public can read images"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- Authenticated users can upload
CREATE POLICY "Users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'images');
```

---

## Bước 3: Test Upload

Sau khi setup xong:

1. Vào: http://localhost:3000/upload
2. Đăng nhập với admin account
3. Chọn file và upload

---

## 📝 Storage Structure

```
workflows/
  └── {user_id}/
      └── {workflow_name}.json

videos/
  └── {user_id}/
      └── khoa_hoc/
          └── {video_name}.mp4

documents/
  └── {user_id}/
      └── tai_nguyen/
          └── {document_name}.pdf

images/
  └── {user_id}/
      └── thumbnails/
          └── {image_name}.jpg
```

---

## 🔐 Storage Credentials

**Endpoint:** `https://byidgbgvnrfhujprzzge.storage.supabase.co/storage/v1/s3`

**Region:** `us-west-1`

**Access Key:** `79861bcefd30f4efa57639672ae72aad`

**Secret Key:** `MinhL)ng244`

---

## ✅ Next Steps

1. ✅ Tạo buckets trong Dashboard
2. ✅ Set policies (copy SQL ở trên)
3. ✅ Test upload tại `/upload`
4. ✅ Xem files đã upload tại `/profile` → tab Files
