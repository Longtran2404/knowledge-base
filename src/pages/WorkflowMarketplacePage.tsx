import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { WorkflowCard } from '../components/workflow/WorkflowCard';
import { Search, Filter, Grid, List, Star, TrendingUp, Zap } from 'lucide-react';
import { workflowApi } from '../lib/api/workflow-api';
import { toast } from 'sonner';
import type { Workflow, WorkflowSearchParams } from '../types/workflow';
import { WORKFLOW_CATEGORIES } from '../types/workflow';

export default function WorkflowMarketplacePage() {
  const navigate = useNavigate();

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Search & filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all'); // all, free, paid
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'price-low' | 'price-high' | 'rating'>('newest');

  useEffect(() => {
    loadWorkflows();
  }, [searchTerm, selectedCategory, priceFilter, difficultyFilter, sortBy]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);

      const params: WorkflowSearchParams = {
        search: searchTerm || undefined,
        sortBy,
        filters: {
          category: selectedCategory !== 'all' ? selectedCategory : undefined,
          isFree: priceFilter === 'free' ? true : priceFilter === 'paid' ? false : undefined,
          difficulty: difficultyFilter !== 'all' ? difficultyFilter as any : undefined,
        },
      };

      const result = await workflowApi.getPublishedWorkflows(params);
      setWorkflows(result.workflows);
    } catch (error: any) {
      console.error('Error loading workflows:', error);
      toast.error('Không thể tải workflows');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (workflow: Workflow) => {
    navigate(`/workflows/${workflow.workflow_slug}`);
  };

  const handlePurchase = (workflow: Workflow) => {
    if (workflow.is_free) {
      navigate(`/workflows/${workflow.workflow_slug}/download`);
    } else {
      navigate(`/workflows/${workflow.workflow_slug}/checkout`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Hero Section */}
      <div className="relative py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent"
          >
            n8n Workflow Marketplace
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-300 mb-8"
          >
            Khám phá và tải về các workflow n8n chất lượng cao từ cộng đồng
          </motion.p>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap justify-center gap-6 text-sm"
          >
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <Zap className="w-5 h-5 text-yellow-400" />
              <span className="text-white">{workflows.length}+ Workflows</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-white">Tự động hóa dễ dàng</span>
            </div>
            <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full backdrop-blur-sm">
              <Star className="w-5 h-5 text-blue-400" />
              <span className="text-white">Chất lượng cao</span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="sticky top-0 z-10 bg-slate-900/80 backdrop-blur-md border-y border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <Input
                placeholder="Tìm kiếm workflow..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              {/* Category */}
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả danh mục</SelectItem>
                  {WORKFLOW_CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Price */}
              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="free">Miễn phí</SelectItem>
                  <SelectItem value="paid">Có phí</SelectItem>
                </SelectContent>
              </Select>

              {/* Difficulty */}
              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-32 bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Độ khó" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                <SelectTrigger className="w-40 bg-slate-800/50 border-slate-700 text-white">
                  <SelectValue placeholder="Sắp xếp" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Mới nhất</SelectItem>
                  <SelectItem value="popular">Phổ biến</SelectItem>
                  <SelectItem value="rating">Đánh giá cao</SelectItem>
                  <SelectItem value="price-low">Giá thấp → cao</SelectItem>
                  <SelectItem value="price-high">Giá cao → thấp</SelectItem>
                </SelectContent>
              </Select>

              {/* View mode */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-blue-500' : 'border-slate-700'}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-blue-500' : 'border-slate-700'}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">
            Tìm thấy {workflows.length} workflows
          </h2>
          <Button
            onClick={() => navigate('/admin/workflows')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            Quản lý Workflows
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto"></div>
            <p className="mt-4 text-slate-400">Đang tải workflows...</p>
          </div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-xl text-slate-400 mb-4">Không tìm thấy workflow nào</p>
            <Button
              variant="outline"
              className="border-slate-600 text-slate-300"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setPriceFilter('all');
                setDifficultyFilter('all');
              }}
            >
              Xóa bộ lọc
            </Button>
          </div>
        ) : (
          <div
            className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'flex flex-col gap-6'
            }
          >
            {workflows.map((workflow) => (
              <WorkflowCard
                key={workflow.id}
                workflow={workflow}
                onViewDetails={handleViewDetails}
                onPurchase={handlePurchase}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
