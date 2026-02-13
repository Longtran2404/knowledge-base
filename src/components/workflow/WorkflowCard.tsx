import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Star, Download, Eye, Tag, Clock, Zap } from 'lucide-react';
import type { Workflow } from '../../types/workflow';

interface WorkflowCardProps {
  workflow: Workflow;
  onViewDetails: (workflow: Workflow) => void;
  onPurchase: (workflow: Workflow) => void;
}

export const WorkflowCard: React.FC<WorkflowCardProps> = ({
  workflow,
  onViewDetails,
  onPurchase,
}) => {
  const formatPrice = (price: number) => {
    if (price === 0) return 'MIỄN PHÍ';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Beginner':
        return 'bg-green-500/20 text-green-300';
      case 'Intermediate':
        return 'bg-yellow-500/20 text-yellow-300';
      case 'Advanced':
        return 'bg-red-500/20 text-red-300';
      default:
        return 'bg-gray-500/20 text-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="h-full"
    >
      <Card className="h-full bg-gradient-to-br from-slate-900/90 to-slate-800/90 border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 backdrop-blur-sm overflow-hidden group">
        {/* Thumbnail */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={workflow.workflow_thumbnail || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=500'}
            alt={workflow.workflow_name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => { e.currentTarget.src = '/images/placeholder.svg'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {workflow.is_free && (
              <Badge className="bg-green-500/90 text-white">
                MIỄN PHÍ
              </Badge>
            )}
            {workflow.is_featured && (
              <Badge className="bg-yellow-500/90 text-slate-900">
                ⭐ NỔI BẬT
              </Badge>
            )}
          </div>

          <div className="absolute top-3 right-3">
            <Badge className={getDifficultyColor(workflow.difficulty_level)}>
              {workflow.difficulty_level}
            </Badge>
          </div>

          {/* Quick stats */}
          <div className="absolute bottom-3 left-3 flex gap-3 text-white text-sm">
            <span className="flex items-center gap-1">
              <Download className="w-4 h-4" />
              {workflow.download_count}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              {workflow.view_count}
            </span>
          </div>
        </div>

        <CardHeader className="pb-3">
          <h3 className="text-lg font-bold text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
            {workflow.workflow_name}
          </h3>
          <p className="text-sm text-slate-400 line-clamp-2">
            {workflow.workflow_description}
          </p>
        </CardHeader>

        <CardContent className="pb-3 space-y-3">
          {/* Category & Creator */}
          <div className="flex items-center justify-between text-sm">
            <Badge variant="outline" className="border-slate-600 text-slate-300">
              {workflow.workflow_category}
            </Badge>
            <span className="text-slate-400">by {workflow.creator_name}</span>
          </div>

          {/* Rating */}
          {workflow.review_count > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${
                      i < Math.floor(workflow.avg_rating)
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-slate-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-slate-300">
                {workflow.avg_rating.toFixed(1)} ({workflow.review_count} đánh giá)
              </span>
            </div>
          )}

          {/* Tags */}
          {workflow.tags && workflow.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {workflow.tags.slice(0, 3).map((tag, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="text-xs border-slate-700 text-slate-400"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Setup time */}
          {workflow.estimated_setup_time && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Clock className="w-4 h-4" />
              Setup: {workflow.estimated_setup_time}
            </div>
          )}

          {/* Nodes count */}
          {workflow.node_count > 0 && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Zap className="w-4 h-4" />
              {workflow.node_count} nodes
            </div>
          )}
        </CardContent>

        <CardFooter className="pt-0 flex items-center justify-between gap-3">
          {/* Price */}
          <div className="flex flex-col">
            <span className={`text-2xl font-bold ${workflow.is_free ? 'text-green-400' : 'text-blue-400'}`}>
              {formatPrice(workflow.workflow_price)}
            </span>
            {workflow.original_price && workflow.original_price > workflow.workflow_price && (
              <span className="text-sm text-slate-500 line-through">
                {formatPrice(workflow.original_price)}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="border-slate-600 text-slate-300 hover:bg-slate-700"
              onClick={() => onViewDetails(workflow)}
            >
              Chi tiết
            </Button>
            <Button
              size="sm"
              className={`${
                workflow.is_free
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600'
              }`}
              onClick={() => onPurchase(workflow)}
            >
              {workflow.is_free ? 'Tải ngay' : 'Mua ngay'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </motion.div>
  );
};
