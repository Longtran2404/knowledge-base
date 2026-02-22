import React, { useEffect, useMemo, useState } from "react";
import { safeParseJson } from "../../lib/safe-json";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Link } from "react-router-dom";
import {
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Circle,
  Play,
  Pause,
  RotateCcw,
  Star,
  ArrowRight,
  BookOpen,
  Users,
  ShoppingCart,
  GraduationCap,
  FileText,
  Handshake,
  Settings,
  Home,
  Search,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface GuideItem {
  id: string;
  title: string;
  description?: string;
  to?: string;
  icon?: React.ReactNode;
  difficulty?: "easy" | "medium" | "hard";
  estimatedTime?: string;
  category?: string;
  isNew?: boolean;
  isPopular?: boolean;
}

export interface GuideSection {
  id: string;
  title: string;
  description?: string;
  items: GuideItem[];
  icon?: React.ReactNode;
  color?: string;
}

type GuideMode = "all" | "pending" | "nextOnly" | "category";
type ViewMode = "list" | "grid" | "timeline";

interface EnhancedInstructionGuideProps {
  sections: GuideSection[];
  initiallyOpenIds?: string[];
  onComplete?: () => void;
  storageKey?: string;
  mode?: GuideMode;
  viewMode?: ViewMode;
  showProgress?: boolean;
  showStats?: boolean;
  autoPlay?: boolean;
  onItemClick?: (item: GuideItem) => void;
  onViewModeChange?: (mode: ViewMode) => void;
}

const EnhancedInstructionGuide: React.FC<EnhancedInstructionGuideProps> = ({
  sections,
  initiallyOpenIds = [],
  onComplete,
  storageKey = "nlc_enhanced_guide_items_done",
  mode = "all",
  viewMode = "list",
  showProgress = true,
  showStats = true,
  autoPlay = false,
  onItemClick,
  onViewModeChange,
}) => {
  const [openIds, setOpenIds] = useState<Set<string>>(
    new Set(initiallyOpenIds)
  );
  const [doneSet, setDoneSet] = useState<Set<string>>(() => {
    const raw = localStorage.getItem(storageKey);
    const arr = safeParseJson<string[]>(raw, []);
    return new Set(Array.isArray(arr) ? arr : []);
  });
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const toggle = (id: string) => {
    const next = new Set(openIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpenIds(next);
  };

  const toggleItem = (itemId: string) => {
    const next = new Set(doneSet);
    if (next.has(itemId)) next.delete(itemId);
    else next.add(itemId);
    setDoneSet(next);
  };

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(doneSet)));
    } catch {}
  }, [doneSet, storageKey]);

  const flatItems = useMemo(() => sections.flatMap((s) => s.items), [sections]);
  const totalItems = flatItems.length;
  const completedItems = flatItems.filter((i) => doneSet.has(i.id)).length;
  const nextPendingId = useMemo(() => {
    const next = flatItems.find((i) => !doneSet.has(i.id));
    return next?.id;
  }, [flatItems, doneSet]);

  const categories = useMemo(() => {
    const cats = new Set(
      flatItems.map((item) => item.category).filter(Boolean)
    );
    return Array.from(cats);
  }, [flatItems]);

  const filteredSections = useMemo(() => {
    if (selectedCategory === "all") return sections;
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) => item.category === selectedCategory
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [sections, selectedCategory]);

  useEffect(() => {
    if (totalItems > 0 && completedItems === totalItems) {
      onComplete?.();
    }
  }, [completedItems, totalItems, onComplete]);

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "hard":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getDifficultyIcon = (difficulty?: string) => {
    switch (difficulty) {
      case "easy":
        return "🟢";
      case "medium":
        return "🟡";
      case "hard":
        return "🔴";
      default:
        return "⚪";
    }
  };

  const handleItemClick = (item: GuideItem) => {
    toggleItem(item.id);
    onItemClick?.(item);
  };

  const resetProgress = () => {
    setDoneSet(new Set());
    setCurrentStep(0);
  };

  const toggleAutoPlay = () => {
    setIsPlaying(!isPlaying);
  };

  const renderItem = (item: GuideItem, sectionId: string) => {
    const checked = doneSet.has(item.id);
    const isNext = item.id === nextPendingId;

    return (
      <motion.div
        key={item.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`group relative p-4 rounded-lg border transition-all duration-200 ${
          checked
            ? "bg-green-50 border-green-200"
            : isNext
            ? "bg-blue-50 border-blue-200 ring-2 ring-blue-100"
            : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
        }`}
      >
        <div className="flex items-start gap-3">
          <button
            onClick={() => handleItemClick(item)}
            className={`mt-1 p-1 rounded-full transition-all duration-200 ${
              checked
                ? "text-green-600 hover:text-green-700"
                : "text-gray-400 hover:text-gray-600"
            }`}
            aria-label={`Đánh dấu hoàn thành ${item.title}`}
          >
            {checked ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Circle className="w-5 h-5" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {item.icon && <div className="text-gray-600">{item.icon}</div>}
              <h4
                className={`font-medium text-sm ${
                  checked ? "text-green-800 line-through" : "text-gray-900"
                }`}
              >
                {item.title}
              </h4>
              {item.isNew && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-blue-100 text-blue-800"
                >
                  Mới
                </Badge>
              )}
              {item.isPopular && (
                <Badge
                  variant="secondary"
                  className="text-xs bg-orange-100 text-orange-800"
                >
                  <Star className="w-3 h-3 mr-1" />
                  Phổ biến
                </Badge>
              )}
            </div>

            {item.description && (
              <p className="text-xs text-gray-600 mb-2">{item.description}</p>
            )}

            <div className="flex items-center gap-2 flex-wrap">
              {item.difficulty && (
                <Badge
                  variant="outline"
                  className={`text-xs ${getDifficultyColor(item.difficulty)}`}
                >
                  {getDifficultyIcon(item.difficulty)} {item.difficulty}
                </Badge>
              )}
              {item.estimatedTime && (
                <Badge variant="outline" className="text-xs text-gray-600">
                  ⏱️ {item.estimatedTime}
                </Badge>
              )}
              {item.category && (
                <Badge variant="outline" className="text-xs text-gray-600">
                  {item.category}
                </Badge>
              )}
            </div>

            {item.to && (
              <Link
                to={item.to}
                onClick={() => handleItemClick(item)}
                className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 mt-2 group-hover:gap-2 transition-all duration-200"
              >
                Xem chi tiết <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>

        {isNext && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-2 -right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center"
          >
            <Play className="w-2 h-2 text-white" />
          </motion.div>
        )}
      </motion.div>
    );
  };

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredSections.map((section) => (
        <Card key={section.id} className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              {section.icon && <div className="text-lg">{section.icon}</div>}
              <CardTitle className="text-base">{section.title}</CardTitle>
            </div>
            {section.description && (
              <p className="text-sm text-gray-600">{section.description}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-2">
            {section.items
              .filter((it) => {
                if (mode === "all") return true;
                if (mode === "pending") return !doneSet.has(it.id);
                if (mode === "nextOnly") return it.id === nextPendingId;
                return true;
              })
              .map((item) => renderItem(item, section.id))}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredSections.map((section) => {
        const open = openIds.has(section.id);
        const sectionCompleted = section.items.filter((item) =>
          doneSet.has(item.id)
        ).length;
        const sectionTotal = section.items.length;

        return (
          <Card key={section.id} className="overflow-hidden">
            <CardHeader
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggle(section.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {section.icon && (
                    <div className="text-lg">{section.icon}</div>
                  )}
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    {section.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {section.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {showProgress && (
                    <div className="text-xs text-gray-500">
                      {sectionCompleted}/{sectionTotal}
                    </div>
                  )}
                  {open ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </div>
              </div>
              {showProgress && (
                <Progress
                  value={
                    sectionTotal ? (sectionCompleted / sectionTotal) * 100 : 0
                  }
                  className="mt-2"
                />
              )}
            </CardHeader>

            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <CardContent className="space-y-3">
                    {section.items
                      .filter((it) => {
                        if (mode === "all") return true;
                        if (mode === "pending") return !doneSet.has(it.id);
                        if (mode === "nextOnly") return it.id === nextPendingId;
                        return true;
                      })
                      .map((item) => renderItem(item, section.id))}
                  </CardContent>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <BookOpen className="w-6 h-6" />
              Hướng dẫn toàn diện
            </h2>
            <p className="text-blue-100">
              Khám phá tất cả tính năng của Knowledge Base một cách dễ dàng
            </p>
          </div>
          <div className="text-right">
            {showStats && (
              <div className="text-3xl font-bold">
                {completedItems}/{totalItems}
              </div>
            )}
            <div className="text-sm text-blue-100">Hoàn thành</div>
          </div>
        </div>

        {showProgress && (
          <div className="mt-4">
            <Progress
              value={totalItems ? (completedItems / totalItems) * 100 : 0}
              className="h-2"
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-2">
           <Button
             variant={viewMode === "list" ? "default" : "outline"}
             size="sm"
             onClick={() => onViewModeChange?.("list")}
           >
             Danh sách
           </Button>
           <Button
             variant={viewMode === "grid" ? "default" : "outline"}
             size="sm"
             onClick={() => onViewModeChange?.("grid")}
           >
             Lưới
           </Button>
        </div>

        <div className="flex items-center gap-2">
          {categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
            >
              <option value="all">Tất cả danh mục</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}

          <Button variant="outline" size="sm" onClick={resetProgress}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>

          <Button variant="outline" size="sm" onClick={toggleAutoPlay}>
            {isPlaying ? (
              <Pause className="w-4 h-4 mr-1" />
            ) : (
              <Play className="w-4 h-4 mr-1" />
            )}
            {isPlaying ? "Dừng" : "Tự động"}
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "grid" ? renderGridView() : renderListView()}

      {/* Footer Actions */}
      <div className="mt-8 flex flex-wrap gap-3 justify-center">
        <Button
          onClick={() => {
            if (onComplete) onComplete();
          }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <CheckCircle2 className="w-4 h-4 mr-2" />
          Hoàn thành hướng dẫn
        </Button>
        <Button variant="outline" onClick={() => setOpenIds(new Set())}>
          Thu gọn tất cả
        </Button>
        <Button
          variant="outline"
          onClick={() => setOpenIds(new Set(sections.map((s) => s.id)))}
        >
          Mở rộng tất cả
        </Button>
      </div>
    </div>
  );
};

export default EnhancedInstructionGuide;
