/**
 * Admin CMS Page
 * Manage site content dynamically without code changes
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  Save,
  Plus,
  Trash2,
  Edit3,
  Eye,
  EyeOff,
  FileText,
  Code,
  Image as ImageIcon,
  Layout,
  Search,
  Filter,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Badge } from '../components/ui/badge';
import { useAuth } from '../contexts/UnifiedAuthContext';
import { siteContentApi } from '../lib/api/cms-api';
import type { SiteContent, CreateSiteContentDTO, UpdateSiteContentDTO } from '../types/cms';

export default function AdminCMSPage() {
  const { userProfile } = useAuth();
  const [contents, setContents] = useState<SiteContent[]>([]);
  const [filteredContents, setFilteredContents] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPage, setFilterPage] = useState<string>('all');
  const [filterSection, setFilterSection] = useState<string>('all');
  const [showDialog, setShowDialog] = useState(false);
  const [editingContent, setEditingContent] = useState<SiteContent | null>(null);
  const [formData, setFormData] = useState<Partial<CreateSiteContentDTO>>({
    page_key: '',
    section_key: '',
    content_key: '',
    content_value: '',
    content_type: 'text',
    is_active: true,
    display_order: 0,
  });

  // Check admin access
  const isAdmin = userProfile?.account_role === 'admin';

  useEffect(() => {
    if (!isAdmin) {
      toast.error('Bạn không có quyền truy cập trang này');
      return;
    }
    loadContents();
  }, [isAdmin]);

  const filterContents = useCallback(() => {
    let filtered = contents;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (c) =>
          c.page_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.section_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.content_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
          c.content_value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Page filter
    if (filterPage !== 'all') {
      filtered = filtered.filter((c) => c.page_key === filterPage);
    }

    // Section filter
    if (filterSection !== 'all') {
      filtered = filtered.filter((c) => c.section_key === filterSection);
    }

    setFilteredContents(filtered);
  }, [searchTerm, filterPage, filterSection, contents]);

  useEffect(() => {
    filterContents();
  }, [filterContents]);

  const loadContents = async () => {
    try {
      setLoading(true);
      const data = await siteContentApi.getAllSiteContent();
      setContents(data);
    } catch (error: any) {
      console.error('Error loading contents:', error);
      toast.error('Không thể tải nội dung');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingContent(null);
    setFormData({
      page_key: '',
      section_key: '',
      content_key: '',
      content_value: '',
      content_type: 'text',
      is_active: true,
      display_order: 0,
    });
    setShowDialog(true);
  };

  const handleEdit = (content: SiteContent) => {
    setEditingContent(content);
    setFormData({
      page_key: content.page_key,
      section_key: content.section_key,
      content_key: content.content_key,
      content_value: content.content_value,
      content_type: content.content_type,
      is_active: content.is_active,
      display_order: content.display_order,
      metadata: content.metadata,
    });
    setShowDialog(true);
  };

  const handleSave = async () => {
    try {
      if (!formData.page_key || !formData.section_key || !formData.content_key || !formData.content_value) {
        toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
        return;
      }

      if (editingContent) {
        await siteContentApi.updateSiteContent({
          id: editingContent.id,
          ...formData,
        } as UpdateSiteContentDTO);
        toast.success('Đã cập nhật nội dung');
      } else {
        await siteContentApi.createSiteContent(formData as CreateSiteContentDTO);
        toast.success('Đã tạo nội dung mới');
      }

      setShowDialog(false);
      loadContents();
    } catch (error: any) {
      console.error('Error saving content:', error);
      toast.error(error.message || 'Không thể lưu nội dung');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa nội dung này?')) return;

    try {
      await siteContentApi.deleteSiteContent(id);
      toast.success('Đã xóa nội dung');
      loadContents();
    } catch (error: any) {
      console.error('Error deleting content:', error);
      toast.error('Không thể xóa nội dung');
    }
  };

  const handleToggleActive = async (content: SiteContent) => {
    try {
      await siteContentApi.updateSiteContent({
        id: content.id,
        is_active: !content.is_active,
      });
      toast.success(content.is_active ? 'Đã ẩn nội dung' : 'Đã hiển thị nội dung');
      loadContents();
    } catch (error: any) {
      console.error('Error toggling content:', error);
      toast.error('Không thể cập nhật trạng thái');
    }
  };

  // Get unique pages and sections for filters
  const uniquePages = Array.from(new Set(contents.map((c) => c.page_key)));
  const uniqueSections = Array.from(new Set(contents.map((c) => c.section_key)));

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'html':
      case 'markdown':
        return <Code className="w-4 h-4" />;
      case 'image_url':
        return <ImageIcon className="w-4 h-4" />;
      case 'json':
        return <Layout className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p>Bạn không có quyền truy cập trang này</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            🎨 Content Management System
          </h1>
          <p className="text-slate-300">
            Quản lý nội dung trang web động - không cần sửa code
          </p>
        </motion.div>

        {/* Filters & Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 p-6 mb-6"
        >
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                placeholder="Tìm kiếm nội dung..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white"
              />
            </div>

            {/* Page Filter */}
            <Select value={filterPage} onValueChange={setFilterPage}>
              <SelectTrigger className="w-full lg:w-48 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="Tất cả trang" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trang</SelectItem>
                {uniquePages.map((page) => (
                  <SelectItem key={page} value={page}>
                    {page}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Section Filter */}
            <Select value={filterSection} onValueChange={setFilterSection}>
              <SelectTrigger className="w-full lg:w-48 bg-slate-800/50 border-slate-700 text-white">
                <SelectValue placeholder="Tất cả section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả section</SelectItem>
                {uniqueSections.map((section) => (
                  <SelectItem key={section} value={section}>
                    {section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Create Button */}
            <Button
              onClick={handleCreate}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tạo mới
            </Button>
          </div>
        </motion.div>

        {/* Content List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
            <p className="text-slate-400 mt-4">Đang tải...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {filteredContents.map((content, index) => (
              <motion.div
                key={content.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700 p-6 hover:border-purple-500/50 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 bg-purple-500/20 rounded-lg">
                        {getContentTypeIcon(content.content_type)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {content.page_key}
                          </Badge>
                          <span className="text-slate-400">/</span>
                          <Badge variant="outline" className="text-xs">
                            {content.section_key}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-semibold text-white mt-1">
                          {content.content_key}
                        </h3>
                      </div>
                    </div>

                    {/* Content Preview */}
                    <div className="bg-slate-900/50 rounded-lg p-4 mb-3">
                      <p className="text-slate-300 line-clamp-3">
                        {content.content_value}
                      </p>
                    </div>

                    {/* Meta */}
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                      <span>Type: {content.content_type}</span>
                      <span>•</span>
                      <span>Order: {content.display_order}</span>
                      {content.metadata && Object.keys(content.metadata).length > 0 && (
                        <>
                          <span>•</span>
                          <span>Has metadata</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleToggleActive(content)}
                      className="text-slate-400 hover:text-white"
                    >
                      {content.is_active ? (
                        <Eye className="w-4 h-4" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(content)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit3 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(content.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredContents.length === 0 && (
              <div className="text-center py-12">
                <p className="text-slate-400">Không có nội dung nào</p>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingContent ? 'Chỉnh sửa nội dung' : 'Tạo nội dung mới'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              {editingContent
                ? 'Cập nhật nội dung hiện tại'
                : 'Thêm nội dung mới vào trang web'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Page Key *
                </label>
                <Input
                  value={formData.page_key}
                  onChange={(e) =>
                    setFormData({ ...formData, page_key: e.target.value })
                  }
                  placeholder="home, about, contact..."
                  className="bg-slate-900/50 border-slate-700"
                />
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Section Key *
                </label>
                <Input
                  value={formData.section_key}
                  onChange={(e) =>
                    setFormData({ ...formData, section_key: e.target.value })
                  }
                  placeholder="hero, features, footer..."
                  className="bg-slate-900/50 border-slate-700"
                />
              </div>
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Content Key *
              </label>
              <Input
                value={formData.content_key}
                onChange={(e) =>
                  setFormData({ ...formData, content_key: e.target.value })
                }
                placeholder="title, subtitle, button_text..."
                className="bg-slate-900/50 border-slate-700"
              />
            </div>

            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Content Value *
              </label>
              <Textarea
                value={formData.content_value}
                onChange={(e) =>
                  setFormData({ ...formData, content_value: e.target.value })
                }
                placeholder="Nội dung của bạn..."
                rows={5}
                className="bg-slate-900/50 border-slate-700"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Content Type
                </label>
                <Select
                  value={formData.content_type}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, content_type: value })
                  }
                >
                  <SelectTrigger className="bg-slate-900/50 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                    <SelectItem value="image_url">Image URL</SelectItem>
                    <SelectItem value="json">JSON</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-slate-300 mb-2 block">
                  Display Order
                </label>
                <Input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      display_order: parseInt(e.target.value) || 0,
                    })
                  }
                  className="bg-slate-900/50 border-slate-700"
                />
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_active}
                    onChange={(e) =>
                      setFormData({ ...formData, is_active: e.target.checked })
                    }
                    className="w-4 h-4"
                  />
                  <span className="text-sm text-slate-300">Active</span>
                </label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDialog(false)}
              className="border-slate-700"
            >
              Hủy
            </Button>
            <Button
              onClick={handleSave}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Save className="w-4 h-4 mr-2" />
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
