import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/UnifiedAuthContext';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '../components/ui/tabs';
import {
  Plus,
  Upload,
  FileText,
  ShoppingCart,
  BarChart3,
  Edit,
  Trash2,
  Check,
  X,
  Eye,
  Download,
  Image as ImageIcon,
  FileJson,
  AlertCircle,
  DollarSign,
} from 'lucide-react';
import { workflowApi, orderApi, statsApi } from '../lib/api/workflow-api';
import { toast } from 'sonner';
import type {
  Workflow,
  WorkflowOrder,
  CreateWorkflowDTO,
  UpdateWorkflowDTO,
  VerifyOrderDTO,
  WorkflowStats,
} from '../types/workflow';
import { WORKFLOW_CATEGORIES } from '../types/workflow';
import { supabase } from '../lib/supabase-config';
import { AIImageGenerator } from '../components/workflow/AIImageGenerator';
import { RevenueStats, CommissionBreakdown, type RevenueData } from '../components/workflow/RevenueStats';

// Type-safe wrapper
const db = supabase as any;

export default function WorkflowManagementPage() {
  const { user, userProfile } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('my-workflows');

  // Check authorization
  const isAdmin = userProfile?.account_role === 'admin';
  const isPartner = userProfile?.account_role === 'giang_vien' || userProfile?.account_role === 'quan_ly';
  const canManage = isAdmin || isPartner;

  useEffect(() => {
    if (!canManage) {
      toast.error('Bạn không có quyền truy cập trang này');
      navigate('/workflows');
    }
  }, [canManage, navigate]);

  if (!canManage) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Quản lý Workflow
          </h1>
          <p className="text-slate-300">
            {isAdmin ? 'Quản lý toàn bộ workflows và đơn hàng' : 'Quản lý workflows của bạn'}
          </p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-slate-800/50 border border-slate-700">
            <TabsTrigger value="my-workflows" className="data-[state=active]:bg-purple-500">
              <FileText className="w-4 h-4 mr-2" />
              Workflows của tôi
            </TabsTrigger>
            <TabsTrigger value="upload" className="data-[state=active]:bg-purple-500">
              <Plus className="w-4 h-4 mr-2" />
              Tạo mới
            </TabsTrigger>
            {isAdmin && (
              <TabsTrigger value="orders" className="data-[state=active]:bg-purple-500">
                <ShoppingCart className="w-4 h-4 mr-2" />
                Đơn hàng
              </TabsTrigger>
            )}
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500">
              <BarChart3 className="w-4 h-4 mr-2" />
              Thống kê
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-workflows">
            <MyWorkflowsTab isAdmin={isAdmin} />
          </TabsContent>

          <TabsContent value="upload">
            <UploadWorkflowTab />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="orders">
              <OrdersManagementTab />
            </TabsContent>
          )}

          <TabsContent value="analytics">
            <AnalyticsTab isAdmin={isAdmin} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// ============================================
// TAB 1: My Workflows
// ============================================
function MyWorkflowsTab({ isAdmin }: { isAdmin: boolean }) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadWorkflows = useCallback(async () => {
    try {
      setLoading(true);
      const result = await workflowApi.getMyWorkflows();
      // Filter locally if needed
      const filtered = statusFilter !== 'all'
        ? result.filter((w: Workflow) => w.workflow_status === statusFilter)
        : result;
      setWorkflows(filtered);
    } catch (error: any) {
      console.error('Error loading workflows:', error);
      toast.error('Không thể tải workflows');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa workflow này?')) return;

    try {
      await workflowApi.deleteWorkflow(id);
      toast.success('Đã xóa workflow');
      loadWorkflows();
    } catch (error: any) {
      toast.error('Không thể xóa workflow');
    }
  };

  const handlePublish = async (id: string) => {
    try {
      await workflowApi.publishWorkflow(id);
      toast.success('Đã duyệt workflow');
      loadWorkflows();
    } catch (error: any) {
      toast.error('Không thể duyệt workflow');
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Lý do từ chối:');
    if (!reason) return;

    try {
      await workflowApi.rejectWorkflow(id, reason);
      toast.success('Đã từ chối workflow');
      loadWorkflows();
    } catch (error: any) {
      toast.error('Không thể từ chối workflow');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      draft: { label: 'Nháp', className: 'bg-slate-500' },
      pending: { label: 'Chờ duyệt', className: 'bg-yellow-500' },
      published: { label: 'Đã duyệt', className: 'bg-green-500' },
      rejected: { label: 'Từ chối', className: 'bg-red-500' },
    };
    const variant = variants[status] || variants.draft;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700 p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Danh sách Workflows</h2>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="draft">Nháp</SelectItem>
            <SelectItem value="pending">Chờ duyệt</SelectItem>
            <SelectItem value="published">Đã duyệt</SelectItem>
            <SelectItem value="rejected">Từ chối</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
          <p className="mt-4 text-slate-400">Đang tải...</p>
        </div>
      ) : workflows.length === 0 ? (
        <div className="text-center py-12 text-slate-400">
          Chưa có workflow nào
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Tên workflow</TableHead>
                <TableHead className="text-slate-300">Trạng thái</TableHead>
                <TableHead className="text-slate-300">Giá</TableHead>
                <TableHead className="text-slate-300">Đánh giá</TableHead>
                <TableHead className="text-slate-300">Lượt tải</TableHead>
                <TableHead className="text-slate-300">Ngày tạo</TableHead>
                <TableHead className="text-slate-300 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workflows.map((workflow) => (
                <TableRow key={workflow.id} className="border-slate-700">
                  <TableCell className="font-medium text-white">
                    {workflow.workflow_name}
                  </TableCell>
                  <TableCell>{getStatusBadge(workflow.workflow_status)}</TableCell>
                  <TableCell className="text-slate-300">
                    {workflow.is_free ? (
                      <Badge className="bg-blue-500">Miễn phí</Badge>
                    ) : (
                      `${workflow.workflow_price.toLocaleString('vi-VN')}đ`
                    )}
                  </TableCell>
                  <TableCell className="text-slate-300">
                    ⭐ {workflow.avg_rating?.toFixed(1) || '0.0'} ({workflow.review_count || 0})
                  </TableCell>
                  <TableCell className="text-slate-300">{workflow.download_count}</TableCell>
                  <TableCell className="text-slate-300">
                    {new Date(workflow.created_at).toLocaleDateString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600"
                        onClick={() => window.open(`/workflows/${workflow.workflow_slug}`, '_blank')}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {isAdmin && workflow.workflow_status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => handlePublish(workflow.id)}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => handleReject(workflow.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600"
                        onClick={() => toast.info('Edit functionality coming soon')}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-red-600 text-red-400 hover:bg-red-500/20"
                        onClick={() => handleDelete(workflow.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// TAB 2: Upload Workflow
// ============================================
function UploadWorkflowTab() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'basic' | 'files' | 'pricing'>('basic');

  // Basic info
  const [formData, setFormData] = useState({
    workflow_name: '',
    workflow_slug: '',
    short_description: '',
    long_description: '',
    category: '',
    tags: '',
    difficulty_level: 'Intermediate',
    setup_time_minutes: 30,
    nodes_count: 5,
  });

  // Files
  const [workflowFile, setWorkflowFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(''); // For AI-generated images
  const [docFiles, setDocFiles] = useState<File[]>([]);

  // Pricing
  const [pricing, setPricing] = useState({
    is_free: false,
    workflow_price: 0,
    original_price: 0,
    discount_percent: 0,
    commission_percent: 20,
  });

  const handleBasicInfoChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Auto-generate slug from name
    if (field === 'workflow_name') {
      const slug = value
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      setFormData(prev => ({ ...prev, workflow_slug: slug }));
    }
  };

  const handleSubmit = async () => {
    if (!workflowFile) {
      toast.error('Vui lòng tải lên file workflow JSON');
      return;
    }

    try {
      setLoading(true);

      // Upload workflow JSON file
      const workflowFileName = `${Date.now()}_${workflowFile.name}`;
      const { data: workflowFileData, error: workflowFileError } = await db.storage
        .from('workflow-files')
        .upload(workflowFileName, workflowFile);

      if (workflowFileError) throw workflowFileError;

      // Upload thumbnail
      let finalThumbnailUrl = thumbnailUrl; // AI-generated URL
      if (thumbnailFile) {
        const thumbnailFileName = `${Date.now()}_${thumbnailFile.name}`;
        const { data: thumbnailData, error: thumbnailError } = await db.storage
          .from('workflow-thumbnails')
          .upload(thumbnailFileName, thumbnailFile);

        if (thumbnailError) throw thumbnailError;

        const { data: thumbnailPublicUrl } = db.storage
          .from('workflow-thumbnails')
          .getPublicUrl(thumbnailFileName);
        finalThumbnailUrl = thumbnailPublicUrl.publicUrl;
      }

      // Upload documentation files
      const uploadedDocs: string[] = [];
      for (const docFile of docFiles) {
        const docFileName = `${Date.now()}_${docFile.name}`;
        const { data: docData, error: docError } = await db.storage
          .from('workflow-docs')
          .upload(docFileName, docFile);

        if (docError) throw docError;
        uploadedDocs.push(docFileName);
      }

      // Create workflow
      const dto: CreateWorkflowDTO = {
        ...formData,
        ...pricing,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        workflow_file_url: workflowFileData.path,
        workflow_thumbnail: finalThumbnailUrl,
        documentation_files: uploadedDocs as any,
      } as any; // Cast to fix type mismatch with extra fields from formData

      const workflow = await workflowApi.createWorkflow(dto);
      toast.success('Đã tạo workflow thành công! Đang chờ admin duyệt.');
      navigate(`/workflows/${workflow.workflow_slug}`);
    } catch (error: any) {
      console.error('Error creating workflow:', error);
      toast.error('Không thể tạo workflow: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-800/30 backdrop-blur-sm rounded-lg border border-slate-700 p-6"
    >
      <h2 className="text-2xl font-bold text-white mb-6">Tạo Workflow Mới</h2>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8">
        {['basic', 'files', 'pricing'].map((s, idx) => (
          <React.Fragment key={s}>
            <div
              className={`flex items-center gap-2 px-4 py-2 rounded-full ${
                step === s ? 'bg-purple-500 text-white' : 'bg-slate-700 text-slate-400'
              }`}
            >
              <span className="font-semibold">{idx + 1}</span>
              <span className="capitalize">{s === 'basic' ? 'Thông tin' : s === 'files' ? 'Files' : 'Giá'}</span>
            </div>
            {idx < 2 && <div className="w-12 h-0.5 bg-slate-700 mx-2" />}
          </React.Fragment>
        ))}
      </div>

      {/* Step: Basic Info */}
      {step === 'basic' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tên workflow *</label>
            <Input
              value={formData.workflow_name}
              onChange={(e) => handleBasicInfoChange('workflow_name', e.target.value)}
              placeholder="VD: Tự động đăng bài lên mạng xã hội"
              className="bg-slate-800/50 border-slate-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Slug (URL)</label>
            <Input
              value={formData.workflow_slug}
              onChange={(e) => handleBasicInfoChange('workflow_slug', e.target.value)}
              placeholder="auto-social-media-posting"
              className="bg-slate-800/50 border-slate-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Mô tả ngắn *</label>
            <Textarea
              value={formData.short_description}
              onChange={(e) => handleBasicInfoChange('short_description', e.target.value)}
              placeholder="Mô tả ngắn gọn về workflow (1-2 câu)"
              rows={2}
              className="bg-slate-800/50 border-slate-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Mô tả chi tiết *</label>
            <Textarea
              value={formData.long_description}
              onChange={(e) => handleBasicInfoChange('long_description', e.target.value)}
              placeholder="Mô tả chi tiết về workflow, tính năng, lợi ích..."
              rows={6}
              className="bg-slate-800/50 border-slate-700 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Danh mục *</label>
              <Select value={formData.category} onValueChange={(v) => handleBasicInfoChange('category', v)}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  {WORKFLOW_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Độ khó</label>
              <Select value={formData.difficulty_level} onValueChange={(v) => handleBasicInfoChange('difficulty_level', v)}>
                <SelectTrigger className="bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Tags (phân cách bởi dấu phẩy)</label>
            <Input
              value={formData.tags}
              onChange={(e) => handleBasicInfoChange('tags', e.target.value)}
              placeholder="automation, social-media, marketing"
              className="bg-slate-800/50 border-slate-700 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Thời gian setup (phút)</label>
              <Input
                type="number"
                value={formData.setup_time_minutes}
                onChange={(e) => handleBasicInfoChange('setup_time_minutes', parseInt(e.target.value))}
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Số lượng nodes</label>
              <Input
                type="number"
                value={formData.nodes_count}
                onChange={(e) => handleBasicInfoChange('nodes_count', parseInt(e.target.value))}
                className="bg-slate-800/50 border-slate-700 text-white"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={() => setStep('files')} className="bg-purple-500 hover:bg-purple-600">
              Tiếp tục
            </Button>
          </div>
        </div>
      )}

      {/* Step: Files */}
      {step === 'files' && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <FileJson className="inline w-4 h-4 mr-1" />
              File workflow JSON *
            </label>
            <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center bg-slate-800/30">
              <input
                type="file"
                accept=".json"
                onChange={(e) => setWorkflowFile(e.target.files?.[0] || null)}
                className="hidden"
                id="workflow-file"
              />
              <label htmlFor="workflow-file" className="cursor-pointer">
                <Upload className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                <p className="text-slate-300">{workflowFile ? workflowFile.name : 'Chọn file JSON'}</p>
                <p className="text-sm text-slate-500 mt-1">Export từ n8n</p>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <ImageIcon className="inline w-4 h-4 mr-1" />
              Thumbnail (Ảnh đại diện)
            </label>

            {/* AI Image Generator Button */}
            <div className="mb-4">
              <AIImageGenerator
                workflowName={formData.workflow_name || 'My Workflow'}
                category={formData.category || 'Automation'}
                onImageGenerated={(url) => {
                  setThumbnailUrl(url);
                  setThumbnailFile(null); // Clear manual upload
                  toast.success('Đã tạo ảnh bằng AI!');
                }}
              />
            </div>

            {/* Preview AI-generated or uploaded image */}
            {(thumbnailUrl || thumbnailFile) && (
              <div className="mb-4 border-2 border-green-500 rounded-lg overflow-hidden">
                <img
                  src={thumbnailUrl || (thumbnailFile ? URL.createObjectURL(thumbnailFile) : '')}
                  alt="Thumbnail preview"
                  className="w-full h-48 object-cover"
                />
                <div className="p-2 bg-slate-800 text-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setThumbnailUrl('');
                      setThumbnailFile(null);
                    }}
                    className="border-red-600 text-red-400"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Xóa ảnh
                  </Button>
                </div>
              </div>
            )}

            {/* Manual Upload Option */}
            <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center bg-slate-800/30">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  setThumbnailFile(e.target.files?.[0] || null);
                  setThumbnailUrl(''); // Clear AI-generated
                }}
                className="hidden"
                id="thumbnail-file"
              />
              <label htmlFor="thumbnail-file" className="cursor-pointer">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                <p className="text-slate-300">Hoặc upload ảnh thủ công</p>
                <p className="text-sm text-slate-500 mt-1">JPG, PNG (khuyên dùng 800x600)</p>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              <FileText className="inline w-4 h-4 mr-1" />
              Tài liệu hướng dẫn (PDF, Word)
            </label>
            <div className="border-2 border-dashed border-slate-700 rounded-lg p-6 text-center bg-slate-800/30">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                multiple
                onChange={(e) => setDocFiles(Array.from(e.target.files || []))}
                className="hidden"
                id="doc-files"
              />
              <label htmlFor="doc-files" className="cursor-pointer">
                <FileText className="w-12 h-12 mx-auto mb-2 text-slate-400" />
                <p className="text-slate-300">
                  {docFiles.length > 0
                    ? `${docFiles.length} file(s) đã chọn`
                    : 'Chọn file tài liệu'}
                </p>
                <p className="text-sm text-slate-500 mt-1">PDF, DOC, DOCX (có thể chọn nhiều file)</p>
              </label>
            </div>
            {docFiles.length > 0 && (
              <ul className="mt-2 space-y-1">
                {docFiles.map((file, idx) => (
                  <li key={idx} className="text-sm text-slate-400 flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    {file.name}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('basic')} className="border-slate-600">
              Quay lại
            </Button>
            <Button onClick={() => setStep('pricing')} className="bg-purple-500 hover:bg-purple-600">
              Tiếp tục
            </Button>
          </div>
        </div>
      )}

      {/* Step: Pricing */}
      {step === 'pricing' && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is-free"
              checked={pricing.is_free}
              onChange={(e) => setPricing(prev => ({ ...prev, is_free: e.target.checked }))}
              className="w-5 h-5"
            />
            <label htmlFor="is-free" className="text-slate-300 font-medium">
              Workflow miễn phí
            </label>
          </div>

          {!pricing.is_free && (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Giá bán (VND) *</label>
                <Input
                  type="number"
                  value={pricing.workflow_price}
                  onChange={(e) => setPricing(prev => ({ ...prev, workflow_price: parseFloat(e.target.value) }))}
                  placeholder="299000"
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Giá gốc (nếu có giảm giá)</label>
                <Input
                  type="number"
                  value={pricing.original_price}
                  onChange={(e) => setPricing(prev => ({ ...prev, original_price: parseFloat(e.target.value) }))}
                  placeholder="499000"
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Phần trăm giảm giá (tự động tính từ giá gốc)
                </label>
                <Input
                  type="number"
                  value={pricing.discount_percent}
                  onChange={(e) => setPricing(prev => ({ ...prev, discount_percent: parseFloat(e.target.value) }))}
                  placeholder="40"
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Hoa hồng cho đối tác (%) - Admin set
                </label>
                <Input
                  type="number"
                  value={pricing.commission_percent}
                  onChange={(e) => setPricing(prev => ({ ...prev, commission_percent: parseFloat(e.target.value) }))}
                  disabled={userProfile?.account_role !== 'admin'}
                  className="bg-slate-800/50 border-slate-700 text-white"
                />
                <p className="text-sm text-slate-500 mt-1">
                  Đối tác sẽ nhận {pricing.commission_percent}% từ mỗi lần bán
                </p>
              </div>
            </>
          )}

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <h3 className="font-semibold text-blue-400 mb-2">Tóm tắt</h3>
            <ul className="text-sm text-slate-300 space-y-1">
              <li>• Tên: {formData.workflow_name || '(chưa nhập)'}</li>
              <li>• Danh mục: {formData.category || '(chưa chọn)'}</li>
              <li>• File JSON: {workflowFile ? '✅ Đã có' : '❌ Chưa có'}</li>
              <li>• Giá: {pricing.is_free ? 'Miễn phí' : `${pricing.workflow_price.toLocaleString('vi-VN')}đ`}</li>
            </ul>
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('files')} className="border-slate-600">
              Quay lại
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              {loading ? 'Đang tạo...' : 'Tạo Workflow'}
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}

// ============================================
// TAB 3: Orders Management (Admin only)
// ============================================
function OrdersManagementTab() {
  const [orders, setOrders] = useState<WorkflowOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const result = await orderApi.getAllOrders(
        statusFilter !== 'all' ? statusFilter as any : undefined
      );
      setOrders(result);
    } catch (error: any) {
      console.error('Error loading orders:', error);
      toast.error('Không thể tải đơn hàng');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleVerifyOrder = async (orderId: string, approved: boolean) => {
    const dto: VerifyOrderDTO = {
      order_id: orderId,
      verified: approved,
      admin_notes: approved ? 'Đã xác nhận thanh toán' : 'Từ chối thanh toán',
    };

    try {
      await orderApi.verifyOrder(dto);
      toast.success(approved ? 'Đã duyệt đơn hàng' : 'Đã từ chối đơn hàng');
      loadOrders();
      // TODO: Send email to buyer with files if approved
    } catch (error: any) {
      toast.error('Không thể xử lý đơn hàng');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { label: string; className: string }> = {
      pending: { label: 'Chờ thanh toán', className: 'bg-yellow-500' },
      verifying: { label: 'Chờ xác nhận', className: 'bg-blue-500' },
      confirmed: { label: 'Đã xác nhận', className: 'bg-green-500' },
      rejected: { label: 'Từ chối', className: 'bg-red-500' },
    };
    const variant = variants[status] || variants.pending;
    return <Badge className={variant.className}>{variant.label}</Badge>;
  };

  // Calculate stats
  const totalOrders = orders.length;
  const verifyingOrders = orders.filter(o => o.payment_status === 'verifying').length;
  const totalRevenue = orders
    .filter(o => o.payment_status === 'confirmed')
    .reduce((sum, o) => sum + o.total_amount, 0);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            Quản lý Đơn hàng
          </h2>
          <p className="text-slate-400 mt-1">
            {totalOrders} đơn hàng • {verifyingOrders} chờ xác nhận
          </p>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48 bg-slate-800/50 border-slate-700 text-white">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="pending">Chờ thanh toán</SelectItem>
            <SelectItem value="verifying">Chờ xác nhận</SelectItem>
            <SelectItem value="confirmed">Đã xác nhận</SelectItem>
            <SelectItem value="rejected">Từ chối</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Tổng đơn</span>
            <ShoppingCart className="w-5 h-5 text-purple-400" />
          </div>
          <p className="text-3xl font-bold text-white">{totalOrders}</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm rounded-xl border border-yellow-700/30 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Chờ xác nhận</span>
            <AlertCircle className="w-5 h-5 text-yellow-400" />
          </div>
          <p className="text-3xl font-bold text-yellow-400">{verifyingOrders}</p>
        </div>

        <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm rounded-xl border border-green-700/30 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400">Doanh thu</span>
            <DollarSign className="w-5 h-5 text-green-400" />
          </div>
          <p className="text-2xl font-bold text-green-400">{totalRevenue.toLocaleString('vi-VN')}đ</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
            <p className="mt-4 text-slate-400">Đang tải...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            Chưa có đơn hàng nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow className="border-slate-700">
                <TableHead className="text-slate-300">Mã đơn</TableHead>
                <TableHead className="text-slate-300">Khách hàng</TableHead>
                <TableHead className="text-slate-300">Workflow</TableHead>
                <TableHead className="text-slate-300">Số tiền</TableHead>
                <TableHead className="text-slate-300">Trạng thái</TableHead>
                <TableHead className="text-slate-300">Ngày tạo</TableHead>
                <TableHead className="text-slate-300 text-right">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id} className="border-slate-700">
                  <TableCell className="font-mono text-white">{order.order_code}</TableCell>
                  <TableCell className="text-slate-300">
                    <div>
                      <p className="font-medium">{order.buyer_name}</p>
                      <p className="text-sm text-slate-500">{order.buyer_email}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-300">{order.workflow?.workflow_name}</TableCell>
                  <TableCell className="text-slate-300">
                    {order.total_amount.toLocaleString('vi-VN')}đ
                  </TableCell>
                  <TableCell>{getStatusBadge(order.payment_status)}</TableCell>
                  <TableCell className="text-slate-300">
                    {new Date(order.created_at).toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      {order.payment_proof_image && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-600"
                          onClick={() => window.open(order.payment_proof_image, '_blank')}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      )}
                      {order.payment_status === 'verifying' && (
                        <>
                          <Button
                            size="sm"
                            className="bg-green-500 hover:bg-green-600"
                            onClick={() => handleVerifyOrder(order.id, true)}
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Duyệt
                          </Button>
                          <Button
                            size="sm"
                            className="bg-red-500 hover:bg-red-600"
                            onClick={() => handleVerifyOrder(order.id, false)}
                          >
                            <X className="w-4 h-4 mr-1" />
                            Từ chối
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        )}
      </div>
    </motion.div>
  );
}

// ============================================
// TAB 4: Analytics
// ============================================
function AnalyticsTab({ isAdmin }: { isAdmin: boolean }) {
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await statsApi.getWorkflowStats();
      setStats(data);
    } catch (error: any) {
      console.error('Error loading stats:', error);
      toast.error('Không thể tải thống kê');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400 mx-auto"></div>
        <p className="mt-4 text-slate-400">Đang tải thống kê...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-slate-400">
        Không có dữ liệu thống kê
      </div>
    );
  }

  // Calculate revenue data
  const revenueData: RevenueData = {
    totalRevenue: stats.totalRevenue || 0,
    totalSales: stats.totalSales || 0,
    totalCommission: (stats.totalRevenue || 0) * 0.2, // 20% commission for partners
    averageOrderValue: stats.totalSales > 0 ? (stats.totalRevenue || 0) / stats.totalSales : 0,
    monthlyRevenue: stats.monthlyRevenue,
    monthlyGrowth: stats.monthlyGrowth,
  };

  // Calculate commission breakdown by workflow
  const commissionBreakdown = stats.topWorkflows?.map(wf => ({
    name: wf.workflow_name,
    sales: wf.purchase_count || 0,
    revenue: wf.revenue || 0,
    commission_percent: 20, // Default 20%
    commission_earned: (wf.revenue || 0) * 0.2,
  })) || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header with Period Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
            {isAdmin ? 'Thống kê toàn hệ thống' : 'Thống kê của tôi'}
          </h2>
          <p className="text-slate-400 mt-1">
            Tổng quan doanh thu và hiệu suất workflows
          </p>
        </div>
      </div>

      {/* Revenue Stats Cards */}
      <RevenueStats data={revenueData} isPartner={!isAdmin} />

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Workflows */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Workflows</h3>
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-2">{stats.totalWorkflows}</p>
          <p className="text-sm text-slate-400">
            {stats.publishedWorkflows || 0} đã publish • {stats.pendingWorkflows || 0} chờ duyệt
          </p>
        </div>

        {/* Downloads */}
        <div className="bg-gradient-to-br from-slate-800/50 to-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Lượt tải</h3>
            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center">
              <Download className="w-5 h-5 text-cyan-400" />
            </div>
          </div>
          <p className="text-4xl font-bold text-white mb-2">{stats.totalDownloads}</p>
          <p className="text-sm text-slate-400">
            Trung bình {stats.totalWorkflows > 0 ? Math.round(stats.totalDownloads / stats.totalWorkflows) : 0} tải/workflow
          </p>
        </div>
      </div>

      {/* Commission Breakdown (for partners) */}
      {!isAdmin && commissionBreakdown.length > 0 && (
        <CommissionBreakdown workflows={commissionBreakdown} />
      )}

      {/* Top Workflows */}
      {stats.topWorkflows && stats.topWorkflows.length > 0 && (
        <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white">🏆 Top Workflows</h3>
            <span className="text-sm text-slate-400">Theo doanh thu</span>
          </div>
          <div className="space-y-3">
            {stats.topWorkflows.map((wf, idx) => {
              const revenue = wf.revenue || 0;
              const maxRevenue = Math.max(...stats.topWorkflows!.map(w => w.revenue || 0));
              const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative"
                >
                  <div className="flex items-center gap-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700 hover:border-purple-500/50 transition-all">
                    {/* Rank Badge */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                      idx === 0 ? 'bg-gradient-to-br from-yellow-500 to-orange-500' :
                      idx === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                      idx === 2 ? 'bg-gradient-to-br from-orange-600 to-orange-700' :
                      'bg-slate-700'
                    }`}>
                      {idx + 1}
                    </div>

                    {/* Workflow Info */}
                    <div className="flex-1">
                      <p className="font-semibold text-white group-hover:text-purple-400 transition-colors">
                        {wf.workflow_name}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-slate-400">
                        <span>{wf.purchase_count || 0} đơn</span>
                      </div>

                      {/* Revenue Progress Bar */}
                      <div className="mt-3 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ duration: 0.8, delay: idx * 0.1 }}
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                        />
                      </div>
                    </div>

                    {/* Revenue */}
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-400">
                        {revenue.toLocaleString('vi-VN')}đ
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {wf.purchase_count || 0} đơn hàng
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* No Data State */}
      {(!stats.topWorkflows || stats.topWorkflows.length === 0) && (
        <div className="text-center py-12 bg-slate-800/30 rounded-xl border border-slate-700">
          <BarChart3 className="w-16 h-16 mx-auto text-slate-600 mb-4" />
          <p className="text-slate-400 text-lg">Chưa có dữ liệu thống kê</p>
          <p className="text-slate-500 text-sm mt-2">Tạo và bán workflows để xem thống kê</p>
        </div>
      )}
    </motion.div>
  );
}
