-- Create storage bucket for user avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-avatars', 'user-avatars', true);

-- Create storage policy to allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'user-avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create storage policy to allow authenticated users to update their own avatars
CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE WITH CHECK (
        bucket_id = 'user-avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create storage policy to allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'user-avatars' 
        AND auth.uid()::text = (storage.foldername(name))[1]
    );

-- Create storage policy to allow public read access to avatars
CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'user-avatars');

-- Alternative bucket setup if the above doesn't work:
-- You can also create the bucket manually through Supabase Dashboard:
-- 1. Go to Storage in your Supabase dashboard
-- 2. Create a new bucket called 'user-avatars'  
-- 3. Set it to 'Public bucket' 
-- 4. The policies above should then work correctly

-- File size limits and allowed file types can be set in the bucket settings
-- Recommended settings:
-- - Max file size: 5MB
-- - Allowed MIME types: image/jpeg, image/png, image/webp