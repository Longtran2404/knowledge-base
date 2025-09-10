import React, { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Upload, 
  File, 
  X, 
  Download, 
  Trash2, 
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { uploadFile, deleteFile, downloadFile, formatFileSize, getFileIcon, FileUpload as FileUploadType } from '../lib/file-service';

interface FileUploadProps {
  fileType: 'personal' | 'public' | 'course_material';
  courseId?: string;
  onUploadComplete?: (file: FileUploadType) => void;
  onFileDelete?: (fileId: string) => void;
  maxFileSize?: number; // in MB
  acceptedTypes?: string[];
  className?: string;
}

export default function FileUpload({
  fileType,
  courseId,
  onUploadComplete,
  onFileDelete,
  maxFileSize = 10, // 10MB default
  acceptedTypes = ['*'],
  className = ''
}: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<FileUploadType[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;

    // Validate files
    for (const file of files) {
      if (file.size > maxFileSize * 1024 * 1024) {
        toast.error(`File ${file.name} quá lớn. Kích thước tối đa: ${maxFileSize}MB`);
        return;
      }

      if (acceptedTypes[0] !== '*' && !acceptedTypes.some(type => file.type.includes(type))) {
        toast.error(`File ${file.name} không được hỗ trợ`);
        return;
      }
    }

    setUploading(true);
    setUploadProgress(0);

    try {
      for (const file of files) {
        const result = await uploadFile(file, fileType, courseId, (progress) => {
          setUploadProgress(progress.percentage);
        });

        if (result.success && result.data) {
          setUploadedFiles(prev => [result.data!, ...prev]);
          onUploadComplete?.(result.data);
          toast.success(`Upload ${file.name} thành công`);
        } else {
          toast.error(`Upload ${file.name} thất bại: ${result.error}`);
        }
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi upload file');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      const result = await deleteFile(fileId);
      if (result.success) {
        setUploadedFiles(prev => prev.filter(file => file.id !== fileId));
        onFileDelete?.(fileId);
        toast.success('Xóa file thành công');
      } else {
        toast.error(`Xóa file thất bại: ${result.error}`);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xóa file');
    }
  };

  const handleDownload = async (fileId: string) => {
    try {
      const result = await downloadFile(fileId);
      if (result.success && result.url) {
        window.open(result.url, '_blank');
      } else {
        toast.error(`Tải file thất bại: ${result.error}`);
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi tải file');
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload File
          </CardTitle>
          <CardDescription>
            Kéo thả file vào đây hoặc click để chọn file
            <br />
            Kích thước tối đa: {maxFileSize}MB
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={acceptedTypes.join(',')}
              onChange={handleFileSelect}
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Upload className="h-6 w-6 text-gray-600" />
              </div>
              
              <div>
                <p className="text-lg font-medium text-gray-900">
                  Kéo thả file vào đây
                </p>
                <p className="text-sm text-gray-500">
                  hoặc{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-500 font-medium"
                  >
                    click để chọn file
                  </button>
                </p>
              </div>

              {uploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="h-2" />
                  <p className="text-sm text-gray-600">
                    Đang upload... {Math.round(uploadProgress)}%
                  </p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <File className="h-5 w-5" />
              Files đã upload
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{getFileIcon(file.mime_type)}</span>
                    <div>
                      <p className="font-medium text-sm">{file.original_filename}</p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.file_size)} • {file.download_count} lượt tải
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownload(file.id)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(file.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
