import { supabase } from './supabase-client';

/**
 * Storage Service - Quản lý Supabase Storage
 */

export interface StorageBucket {
  name: string;
  public: boolean;
  fileSizeLimit?: number;
  allowedMimeTypes?: string[];
}

export const STORAGE_BUCKETS = {
  WORKFLOWS: 'workflows',
  VIDEOS: 'videos',
  DOCUMENTS: 'documents',
  IMAGES: 'images',
} as const;

export class StorageService {
  /**
   * Tạo folder structure cho user mới
   */
  static async createUserStorage(userId: string): Promise<void> {
    console.log(`📦 Creating storage for user: ${userId}`);

    try {
      // Tạo placeholder files trong mỗi bucket để tạo folder structure
      const folders = [
        { bucket: STORAGE_BUCKETS.WORKFLOWS, path: `${userId}/.keep` },
        { bucket: STORAGE_BUCKETS.VIDEOS, path: `${userId}/khoa_hoc/.keep` },
        { bucket: STORAGE_BUCKETS.VIDEOS, path: `${userId}/tai_nguyen/.keep` },
        { bucket: STORAGE_BUCKETS.DOCUMENTS, path: `${userId}/tai_nguyen/.keep` },
        { bucket: STORAGE_BUCKETS.DOCUMENTS, path: `${userId}/blog/.keep` },
        { bucket: STORAGE_BUCKETS.IMAGES, path: `${userId}/thumbnails/.keep` },
        { bucket: STORAGE_BUCKETS.IMAGES, path: `${userId}/avatars/.keep` },
      ];

      const results = await Promise.allSettled(
        folders.map(async ({ bucket, path }) => {
          try {
            // Upload empty file để tạo folder
            const { error } = await supabase.storage
              .from(bucket)
              .upload(path, new Blob([''], { type: 'text/plain' }), {
                cacheControl: '3600',
                upsert: false,
              });

            if (error) {
              // Ignore error if bucket doesn't exist or file already exists
              if (error.message.includes('Bucket not found')) {
                console.warn(`⚠️  Bucket "${bucket}" not found - skipping`);
                return { success: false, bucket, reason: 'bucket_not_found' };
              }
              if (error.message.includes('already exists')) {
                console.log(`✅ Folder already exists: ${bucket}/${path}`);
                return { success: true, bucket, path };
              }
              throw error;
            }

            console.log(`✅ Created folder: ${bucket}/${path}`);
            return { success: true, bucket, path };
          } catch (err: any) {
            console.error(`❌ Failed to create ${bucket}/${path}:`, err.message);
            return { success: false, bucket, path, error: err.message };
          }
        })
      );

      // Summary
      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      console.log(`📊 Storage creation summary:`);
      console.log(`   ✅ Success: ${successful}`);
      console.log(`   ❌ Failed: ${failed}`);

      // Return success even if some folders failed (buckets might not exist yet)
      return;
    } catch (error: any) {
      console.error('💥 Error creating user storage:', error);
      // Don't throw - storage creation shouldn't block user registration
    }
  }

  /**
   * Kiểm tra xem buckets đã tồn tại chưa
   */
  static async checkBuckets(): Promise<{
    exists: string[];
    missing: string[];
  }> {
    const requiredBuckets = Object.values(STORAGE_BUCKETS);
    const exists: string[] = [];
    const missing: string[] = [];

    try {
      const { data: buckets, error } = await supabase.storage.listBuckets();

      if (error) {
        console.error('Error checking buckets:', error);
        return { exists: [], missing: requiredBuckets };
      }

      const bucketNames = buckets?.map((b) => b.name) || [];

      for (const bucket of requiredBuckets) {
        if (bucketNames.includes(bucket)) {
          exists.push(bucket);
        } else {
          missing.push(bucket);
        }
      }

      return { exists, missing };
    } catch (error) {
      console.error('Error checking buckets:', error);
      return { exists: [], missing: requiredBuckets };
    }
  }

  /**
   * Tạo buckets tự động (cần service_role key)
   */
  static async createBuckets(): Promise<void> {
    const buckets: StorageBucket[] = [
      {
        name: STORAGE_BUCKETS.WORKFLOWS,
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: ['application/json'],
      },
      {
        name: STORAGE_BUCKETS.VIDEOS,
        public: false, // Private for protected videos
        fileSizeLimit: 500 * 1024 * 1024, // 500MB
        allowedMimeTypes: ['video/*'],
      },
      {
        name: STORAGE_BUCKETS.DOCUMENTS,
        public: true,
        fileSizeLimit: 50 * 1024 * 1024, // 50MB
        allowedMimeTypes: ['application/pdf', 'application/msword', 'application/vnd.*'],
      },
      {
        name: STORAGE_BUCKETS.IMAGES,
        public: true,
        fileSizeLimit: 10 * 1024 * 1024, // 10MB
        allowedMimeTypes: ['image/*'],
      },
    ];

    console.log('🏗️  Creating storage buckets...');

    for (const bucket of buckets) {
      try {
        const { data, error } = await supabase.storage.createBucket(bucket.name, {
          public: bucket.public,
          fileSizeLimit: bucket.fileSizeLimit,
          allowedMimeTypes: bucket.allowedMimeTypes,
        });

        if (error) {
          if (error.message.includes('already exists')) {
            console.log(`✅ Bucket "${bucket.name}" already exists`);
          } else {
            console.error(`❌ Failed to create bucket "${bucket.name}":`, error.message);
          }
        } else {
          console.log(`✅ Created bucket: ${bucket.name}`);
        }
      } catch (err: any) {
        console.error(`💥 Error creating bucket "${bucket.name}":`, err.message);
      }
    }
  }

  /**
   * Upload file to storage
   */
  static async uploadFile(
    bucket: string,
    path: string,
    file: File,
    options?: {
      cacheControl?: string;
      upsert?: boolean;
      contentType?: string;
    }
  ): Promise<{ data: any; error: any }> {
    try {
      const { data, error } = await supabase.storage.from(bucket).upload(path, file, {
        cacheControl: options?.cacheControl || '3600',
        upsert: options?.upsert || false,
        contentType: options?.contentType || file.type,
      });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get public URL for file
   */
  static getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * Get signed URL for private file (expires in 1 hour)
   */
  static async getSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number = 3600
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .createSignedUrl(path, expiresIn);

      if (error) {
        console.error('Error creating signed URL:', error);
        return null;
      }

      return data.signedUrl;
    } catch (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }
  }

  /**
   * Delete file
   */
  static async deleteFile(bucket: string, path: string): Promise<{ error: any }> {
    try {
      const { error } = await supabase.storage.from(bucket).remove([path]);
      return { error };
    } catch (error) {
      return { error };
    }
  }

  /**
   * List files in folder
   */
  static async listFiles(
    bucket: string,
    folder: string = ''
  ): Promise<{ data: any[]; error: any }> {
    try {
      const { data, error } = await supabase.storage.from(bucket).list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' },
      });

      return { data: data || [], error };
    } catch (error) {
      return { data: [], error };
    }
  }
}

export default StorageService;
