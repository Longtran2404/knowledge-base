import React, { useState, useEffect, useCallback } from 'react';
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
import { Search, Grid, List, Star, TrendingUp, Zap } from 'lucide-react';
import { SEO } from '../components/SEO';
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

  const loadWorkflows = useCallback(async () => {
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
  }, [searchTerm, selectedCategory, priceFilter, difficultyFilter, sortBy]);

  useEffect(() => {
    loadWorkflows();
  }, [loadWorkflows]);

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
    <div className="min-h-screen bg-background text-foreground">
      <SEO title="n8n Workflow Marketplace" description="Khám phá và tải workflow n8n chất lượng cao" url="/workflows" />

      {/* Hero */}
      <section className="relative py-16 md:py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <Badge variant="secondary" className="mb-4 bg-primary/10 text-primary border-primary/20">
              <Zap className="h-4 w-4 mr-2" />
              n8n Workflows
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-foreground">
              n8n Workflow Marketplace
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Khám phá và tải về các workflow n8n chất lượng cao từ cộng đồng
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary">
                <Zap className="w-5 h-5" />
                <span>{workflows.length}+ Workflows</span>
              </div>
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary">
                <TrendingUp className="w-5 h-5" />
                <span>Tự động hóa dễ dàng</span>
              </div>
              <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary">
                <Star className="w-5 h-5" />
                <span>Chất lượng cao</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <div className="sticky top-0 z-10 border-y border-border bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm workflow..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-border bg-background text-foreground"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-40">
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

              <Select value={priceFilter} onValueChange={setPriceFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="free">Miễn phí</SelectItem>
                  <SelectItem value="paid">Có phí</SelectItem>
                </SelectContent>
              </Select>

              <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Độ khó" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                <SelectTrigger className="w-40">
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

              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="container mx-auto px-4 py-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h2 className="text-2xl font-bold text-foreground">
            {loading ? "Đang tải..." : `Tìm thấy ${workflows.length} workflows`}
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/workflows')}>
            Quản lý Workflows
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-primary border-t-transparent" />
          </div>
        ) : workflows.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="w-24 h-24 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-12 h-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">Nội dung đang được cập nhật</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Chúng tôi đang chuẩn bị các n8n workflows hữu ích. Vui lòng quay lại sau.
            </p>
            {(searchTerm || selectedCategory !== 'all' || priceFilter !== 'all' || difficultyFilter !== 'all') && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setPriceFilter('all');
                  setDifficultyFilter('all');
                }}
              >
                Xóa bộ lọc
              </Button>
            )}
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
