import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { uploadAvatar, updateUserAvatar, deleteOldAvatar } from '../lib/supabase';

interface AvatarUploadProps {
  currentAvatar?: string;
  userId: string;
  userName: string;
  onAvatarUpdate: (newAvatarUrl: string) => void;
  size?: 'sm' | 'md' | 'lg';
}

export default function AvatarUpload({
  currentAvatar,
  userId,
  userName,
  onAvatarUpdate,
  size = 'md'
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24', 
    lg: 'h-32 w-32'
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const validateFile = (file: File): boolean => {
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Chỉ hỗ trợ file ảnh (JPEG, PNG, WebP)');
      return false;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('Kích thước file không được vượt quá 5MB');
      return false;
    }

    return true;
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!validateFile(file)) {
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    handleUpload(file);
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    try {
      // Delete old avatar if exists
      if (currentAvatar) {
        await deleteOldAvatar(currentAvatar);
      }

      // Upload new avatar
      const newAvatarUrl = await uploadAvatar(file, userId);
      
      // Update user profile
      await updateUserAvatar(userId, newAvatarUrl);
      
      // Update parent component
      onAvatarUpdate(newAvatarUrl);
      
      toast.success('Cập nhật avatar thành công!');
      setPreviewUrl(null);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.message || 'Có lỗi xảy ra khi upload avatar');
      setPreviewUrl(null);
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleCancelPreview = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative group">
        <Avatar className={sizeClasses[size]}>
          <AvatarImage 
            src={previewUrl || currentAvatar} 
            alt={userName}
            className="object-cover"
          />
          <AvatarFallback className="text-lg font-semibold">
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        {/* Upload overlay */}
        <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleButtonClick}
            disabled={isUploading}
            className="text-white hover:text-white hover:bg-white/20"
          >
            {isUploading ? (
              <Loader2 className={`${iconSizes[size]} animate-spin`} />
            ) : (
              <Camera className={iconSizes[size]} />
            )}
          </Button>
        </div>

        {/* Cancel preview button */}
        {previewUrl && !isUploading && (
          <Button
            size="sm"
            variant="destructive"
            onClick={handleCancelPreview}
            className="absolute -top-2 -right-2 rounded-full h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Upload button (fallback for mobile) */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleButtonClick}
        disabled={isUploading}
        className="sm:hidden"
      >
        {isUploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Đang tải lên...
          </>
        ) : (
          <>
            <Camera className="h-4 w-4 mr-2" />
            Thay đổi avatar
          </>
        )}
      </Button>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload status */}
      {isUploading && (
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Đang tải lên avatar...
        </div>
      )}

      {/* File size limit info */}
      <p className="text-xs text-muted-foreground text-center">
        Hỗ trợ JPEG, PNG, WebP. Tối đa 5MB.
      </p>
    </div>
  );
}