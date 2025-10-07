/**
 * Storage Service - Quản lý Supabase Storage
 * Tạo và quản lý buckets cho Nam Long Center
 */

import { supabase } from "../supabase-config";

export interface StorageBucket {
  name: string;
  description: string;
  public: boolean;
  allowedMimeTypes: string[];
  fileSizeLimit: number;
}

// Định nghĩa các buckets cho ứng dụng
export const STORAGE_BUCKETS: StorageBucket[] = [
  {
    name: "user-documents",
    description: "Tài liệu cá nhân của người dùng",
    public: false,
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-powerpoint",
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      "text/*"
    ],
    fileSizeLimit: 50 * 1024 * 1024 // 50MB
  },
  {
    name: "user-images",
    description: "Hình ảnh người dùng và ảnh đại diện",
    public: true,
    allowedMimeTypes: ["image/*"],
    fileSizeLimit: 10 * 1024 * 1024 // 10MB
  },
  {
    name: "course-videos",
    description: "Video khóa học",
    public: false,
    allowedMimeTypes: ["video/*"],
    fileSizeLimit: 500 * 1024 * 1024 // 500MB
  },
  {
    name: "course-materials",
    description: "Tài liệu khóa học",
    public: false,
    allowedMimeTypes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/*",
      "image/*"
    ],
    fileSizeLimit: 100 * 1024 * 1024 // 100MB
  },
  {
    name: "blog-attachments",
    description: "File đính kèm bài blog",
    public: true,
    allowedMimeTypes: ["image/*", "application/pdf", "text/*"],
    fileSizeLimit: 20 * 1024 * 1024 // 20MB
  },
  {
    name: "public-resources",
    description: "Tài nguyên công khai",
    public: true,
    allowedMimeTypes: ["*"],
    fileSizeLimit: 100 * 1024 * 1024 // 100MB
  }
];

export class StorageService {
  /**
   * Khởi tạo tất cả buckets cần thiết
   */
  static async initializeBuckets(): Promise<void> {
    console.log("🗂️ Initializing storage buckets...");

    try {
      // Lấy danh sách buckets hiện tại
      const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();

      if (listError) {
        console.error("Failed to list buckets:", listError);
        return;
      }

      const existingBucketNames = existingBuckets?.map(b => b.name) || [];

      // Tạo các buckets chưa tồn tại
      for (const bucket of STORAGE_BUCKETS) {
        if (!existingBucketNames.includes(bucket.name)) {
          console.log(`Creating bucket: ${bucket.name}`);

          const { error: createError } = await supabase.storage.createBucket(bucket.name, {
            public: bucket.public,
            allowedMimeTypes: bucket.allowedMimeTypes,
            fileSizeLimit: bucket.fileSizeLimit
          });

          if (createError) {
            console.error(`Failed to create bucket ${bucket.name}:`, createError);
          } else {
            console.log(`✅ Created bucket: ${bucket.name}`);
          }
        } else {
          console.log(`✓ Bucket exists: ${bucket.name}`);
        }
      }

      console.log("🗂️ Storage buckets initialization completed");
    } catch (error) {
      console.error("Error initializing buckets:", error);
    }
  }

  /**
   * Lấy bucket phù hợp cho loại file
   */
  static getBucketForFileType(fileType: string, category: string): string {
    switch (category) {
      case "course":
        return fileType.startsWith("video/") ? "course-videos" : "course-materials";
      case "blog":
        return "blog-attachments";
      case "document":
        return "user-documents";
      case "image":
        return "user-images";
      case "public":
        return "public-resources";
      default:
        return "user-documents";
    }
  }

  /**
   * Kiểm tra loại file có được phép upload không
   */
  static isFileTypeAllowed(mimeType: string, bucketName: string): boolean {
    const bucket = STORAGE_BUCKETS.find(b => b.name === bucketName);
    if (!bucket) return false;

    return bucket.allowedMimeTypes.some(allowed => {
      if (allowed === "*") return true;
      if (allowed.endsWith("/*")) {
        const prefix = allowed.slice(0, -2);
        return mimeType.startsWith(prefix);
      }
      return mimeType === allowed;
    });
  }

  /**
   * Kiểm tra kích thước file
   */
  static isFileSizeAllowed(fileSize: number, bucketName: string): boolean {
    const bucket = STORAGE_BUCKETS.find(b => b.name === bucketName);
    if (!bucket) return false;
    return fileSize <= bucket.fileSizeLimit;
  }

  /**
   * Upload file với validation
   */
  static async uploadFile(
    file: File,
    bucketName: string,
    storagePath: string,
    options?: {
      cacheControl?: string;
      upsert?: boolean;
    }
  ): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      // Validation
      if (!this.isFileTypeAllowed(file.type, bucketName)) {
        return {
          success: false,
          error: `File type ${file.type} not allowed for ${bucketName}`
        };
      }

      if (!this.isFileSizeAllowed(file.size, bucketName)) {
        const bucket = STORAGE_BUCKETS.find(b => b.name === bucketName);
        const maxSizeMB = bucket ? Math.round(bucket.fileSizeLimit / (1024 * 1024)) : 0;
        return {
          success: false,
          error: `File size exceeds limit of ${maxSizeMB}MB`
        };
      }

      // Upload
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(storagePath, file, {
          cacheControl: options?.cacheControl || "3600",
          upsert: options?.upsert || false,
        });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Upload failed"
      };
    }
  }

  /**
   * Lấy public URL
   */
  static getPublicUrl(bucketName: string, filePath: string): string {
    const { data } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    return data.publicUrl;
  }

  /**
   * Tạo signed URL cho private files
   */
  static async createSignedUrl(
    bucketName: string,
    filePath: string,
    expiresIn: number = 3600
  ): Promise<{ signedUrl?: string; error?: string }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .createSignedUrl(filePath, expiresIn);

      if (error) {
        return { error: error.message };
      }

      return { signedUrl: data.signedUrl };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "Failed to create signed URL"
      };
    }
  }

  /**
   * Xóa file
   */
  static async deleteFile(
    bucketName: string,
    filePath: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase.storage
        .from(bucketName)
        .remove([filePath]);

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Delete failed"
      };
    }
  }

  /**
   * List files trong bucket
   */
  static async listFiles(
    bucketName: string,
    folder?: string
  ): Promise<{ files?: any[]; error?: string }> {
    try {
      const { data, error } = await supabase.storage
        .from(bucketName)
        .list(folder);

      if (error) {
        return { error: error.message };
      }

      return { files: data };
    } catch (error) {
      return {
        error: error instanceof Error ? error.message : "List files failed"
      };
    }
  }
}

// Initialize buckets on module load
if (typeof window !== "undefined") {
  StorageService.initializeBuckets().catch(console.error);
}