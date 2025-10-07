import { supabase } from "./supabase";
import { StorageService } from "./storage/storage-service";

export interface FileUpload {
  id: string;
  user_id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_type: "document" | "video" | "image" | "other";
  course_id?: string;
  is_public: boolean;
  download_count: number;
  created_at: string;
  updated_at: string;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

// Upload file to Supabase Storage using new StorageService
export const uploadFile = async (
  file: File,
  fileType: "document" | "video" | "image" | "other",
  courseId?: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ success: boolean; data?: FileUpload; error?: string }> => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Map old file types to new categories
    let category = "document";
    if (fileType === "video") category = "course";
    if (fileType === "image") category = "image";
    if (fileType === "other") category = "public";

    // Get appropriate bucket for file type
    const bucketName = StorageService.getBucketForFileType(file.type, category);

    // Validate file type and size
    if (!StorageService.isFileTypeAllowed(file.type, bucketName)) {
      return { success: false, error: `Loại file ${file.type} không được hỗ trợ` };
    }

    if (!StorageService.isFileSizeAllowed(file.size, bucketName)) {
      const bucket = StorageService['STORAGE_BUCKETS']?.find((b: any) => b.name === bucketName);
      const maxSizeMB = bucket ? Math.round(bucket.fileSizeLimit / (1024 * 1024)) : 50;
      return { success: false, error: `Kích thước file vượt quá giới hạn ${maxSizeMB}MB` };
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop();
    const filename = `${timestamp}_${randomString}.${fileExtension}`;

    // Create storage path with user organization
    const storagePath = `${user.id}/${filename}`;

    // Report initial progress
    if (onProgress) {
      onProgress({ loaded: 0, total: file.size, percentage: 0 });
    }

    // Initialize buckets if needed
    await StorageService.initializeBuckets();

    // Upload using StorageService
    const result = await StorageService.uploadFile(file, bucketName, storagePath, {
      cacheControl: "3600",
      upsert: false
    });

    if (!result.success) {
      return { success: false, error: result.error };
    }

    // Report completion
    if (onProgress) {
      onProgress({ loaded: file.size, total: file.size, percentage: 100 });
    }

    // Get public URL
    let fileUrl = "";
    try {
      if (bucketName.includes("public") || bucketName === "user-images") {
        fileUrl = StorageService.getPublicUrl(bucketName, storagePath);
      } else {
        const signedResult = await StorageService.createSignedUrl(bucketName, storagePath, 3600);
        fileUrl = signedResult.signedUrl || "";
      }
    } catch (error) {
      console.warn("Could not get file URL:", error);
    }

    console.log("File uploaded successfully:", {
      bucket: bucketName,
      path: storagePath,
      size: file.size,
      type: file.type,
      url: fileUrl
    });

    // Create file data
    const fileData: FileUpload = {
      id: `file_${timestamp}_${randomString}`,
      user_id: user.id,
      filename: filename,
      original_filename: file.name,
      file_path: storagePath,
      file_size: file.size,
      mime_type: file.type,
      file_type: fileType,
      course_id: courseId,
      is_public: bucketName.includes("public") || bucketName === "user-images",
      download_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Add file URL for immediate access
    (fileData as any).file_url = fileUrl;
    (fileData as any).bucket_name = bucketName;

    return { success: true, data: fileData };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload thất bại",
    };
  }
};

// Get user's files
export const getUserFiles = async (userId: string): Promise<FileUpload[]> => {
  const { data, error } = await supabase
    .from("nlc_user_files")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Get public files with pagination and user info
export const getPublicFiles = async (limit?: number, offset?: number): Promise<FileUpload[]> => {
  let query = supabase
    .from("nlc_user_files")
    .select(`
      *,
      user:nlc_accounts!nlc_user_files_user_id_fkey(
        full_name,
        email,
        avatar_url
      )
    `)
    .eq("is_public", true)
    .eq("status", "ready")
    .order("created_at", { ascending: false });

  if (limit) {
    query = query.limit(limit);
  }

  if (offset) {
    query = query.range(offset, offset + (limit || 20) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data || [];
};

// Get files by type
export const getFilesByType = async (
  fileType: "document" | "video" | "image" | "other"
): Promise<FileUpload[]> => {
  const { data, error } = await supabase
    .from("nlc_user_files")
    .select("*")
    .eq("file_type", fileType)
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Delete file
export const deleteFile = async (
  fileId: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    // Get file info first
    const { data: fileData, error: fetchError } = await supabase
      .from("nlc_user_files")
      .select("file_path, bucket_name")
      .eq("id", fileId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    // Delete from storage
    const deleteResult = await StorageService.deleteFile(
      fileData.bucket_name || "user-documents",
      fileData.file_path
    );

    if (!deleteResult.success) {
      console.warn("Storage delete failed:", deleteResult.error);
      // Continue with database deletion even if storage delete fails
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("nlc_user_files")
      .delete()
      .eq("id", fileId);

    if (dbError) {
      return { success: false, error: dbError.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Xóa file thất bại",
    };
  }
};

// Download file
export const downloadFile = async (
  fileId: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const { data: fileData, error } = await supabase
      .from("nlc_user_files")
      .select("file_path, original_filename, bucket_name")
      .eq("id", fileId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Get signed URL for download
    const urlResult = await StorageService.createSignedUrl(
      fileData.bucket_name || "user-documents",
      fileData.file_path,
      3600
    );

    if (urlResult.error) {
      return { success: false, error: urlResult.error };
    }

    // Increment download count
    const { data: currentFile } = await supabase
      .from("nlc_user_files")
      .select("download_count")
      .eq("id", fileId)
      .single();

    if (currentFile) {
      await supabase
        .from("nlc_user_files")
        .update({ download_count: (currentFile.download_count || 0) + 1 })
        .eq("id", fileId);
    }

    return { success: true, url: urlResult.signedUrl };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Download thất bại",
    };
  }
};

// Get file info
export const getFileInfo = async (
  fileId: string
): Promise<FileUpload | null> => {
  const { data, error } = await supabase
    .from("nlc_user_files")
    .select("*")
    .eq("id", fileId)
    .single();

  if (error) return null;
  return data;
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

// Get file icon based on mime type
export const getFileIcon = (mimeType: string): string => {
  if (mimeType.startsWith("image/")) return "🖼️";
  if (mimeType.startsWith("video/")) return "🎥";
  if (mimeType.startsWith("audio/")) return "🎵";
  if (mimeType.includes("pdf")) return "📄";
  if (mimeType.includes("word")) return "📝";
  if (mimeType.includes("excel") || mimeType.includes("spreadsheet"))
    return "📊";
  if (mimeType.includes("powerpoint") || mimeType.includes("presentation"))
    return "📽️";
  if (mimeType.includes("zip") || mimeType.includes("rar")) return "📦";
  return "📁";
};
