import { supabase } from "./supabase";

export interface FileUpload {
  id: string;
  user_id: string;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  file_type: "personal" | "public" | "course_material";
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

// Upload file to Supabase Storage
export const uploadFile = async (
  file: File,
  fileType: "personal" | "public" | "course_material",
  courseId?: string,
  onProgress?: (progress: UploadProgress) => void
): Promise<{ success: boolean; data?: FileUpload; error?: string }> => {
  try {
    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split(".").pop();
    const filename = `${timestamp}_${randomString}.${fileExtension}`;

    // Determine storage path based on file type
    let storagePath = "";
    switch (fileType) {
      case "personal":
        storagePath = `personal/${filename}`;
        break;
      case "public":
        storagePath = `public/${filename}`;
        break;
      case "course_material":
        storagePath = `courses/${courseId}/${filename}`;
        break;
    }

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("files")
      .upload(storagePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("files")
      .getPublicUrl(storagePath);

    // Save file metadata to database
    const { data: fileData, error: dbError } = await supabase
      .from("file_uploads")
      .insert({
        filename: filename,
        original_filename: file.name,
        file_path: storagePath,
        file_size: file.size,
        mime_type: file.type,
        file_type: fileType,
        course_id: courseId || null,
        is_public: fileType === "public",
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from("files").remove([storagePath]);
      return { success: false, error: dbError.message };
    }

    return { success: true, data: fileData };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
};

// Get user's personal files
export const getUserFiles = async (userId: string): Promise<FileUpload[]> => {
  const { data, error } = await supabase
    .from("file_uploads")
    .select("*")
    .eq("user_id", userId)
    .eq("file_type", "personal")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Get public files
export const getPublicFiles = async (): Promise<FileUpload[]> => {
  const { data, error } = await supabase
    .from("file_uploads")
    .select("*")
    .eq("is_public", true)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
};

// Get course materials
export const getCourseMaterials = async (
  courseId: string
): Promise<FileUpload[]> => {
  const { data, error } = await supabase
    .from("file_uploads")
    .select("*")
    .eq("course_id", courseId)
    .eq("file_type", "course_material")
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
      .from("file_uploads")
      .select("file_path")
      .eq("id", fileId)
      .single();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from("files")
      .remove([fileData.file_path]);

    if (storageError) {
      return { success: false, error: storageError.message };
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from("file_uploads")
      .delete()
      .eq("id", fileId);

    if (dbError) {
      return { success: false, error: dbError.message };
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
};

// Download file
export const downloadFile = async (
  fileId: string
): Promise<{ success: boolean; url?: string; error?: string }> => {
  try {
    const { data: fileData, error } = await supabase
      .from("file_uploads")
      .select("file_path, original_filename")
      .eq("id", fileId)
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    // Get signed URL for download
    const { data: urlData, error: urlError } = await supabase.storage
      .from("files")
      .createSignedUrl(fileData.file_path, 3600); // 1 hour expiry

    if (urlError) {
      return { success: false, error: urlError.message };
    }

    // Increment download count
    const { data: currentFile } = await supabase
      .from("file_uploads")
      .select("download_count")
      .eq("id", fileId)
      .single();

    if (currentFile) {
      await supabase
        .from("file_uploads")
        .update({ download_count: currentFile.download_count + 1 })
        .eq("id", fileId);
    }

    return { success: true, url: urlData.signedUrl };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Download failed",
    };
  }
};

// Get file info
export const getFileInfo = async (
  fileId: string
): Promise<FileUpload | null> => {
  const { data, error } = await supabase
    .from("file_uploads")
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
