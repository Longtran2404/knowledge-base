import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FileText,
  Download,
  Eye,
  Search,
  Filter,
  Calendar,
  Tag,
  Lock,
  Users,
  Crown,
} from "lucide-react";

import { Button } from "../../components/ui/button";
import { Card, CardContent, CardHeader } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { Skeleton } from "../../components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { Checkbox } from "../../components/ui/checkbox";

import { Resource } from "../../types/resource";
import { getAccessBadgeColor } from "../../lib/spotlight";

interface ResourceLibraryProps {
  className?: string;
}

export default function ResourceLibrary({ className }: ResourceLibraryProps) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDomain, setSelectedDomain] = useState("all");
  const [selectedAccess, setSelectedAccess] = useState("all");
  const [showFreeOnly, setShowFreeOnly] = useState(false);

  useEffect(() => {
    const fetchResources = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/resources");
        if (!response.ok) {
          throw new Error("Failed to fetch resources");
        }
        const data: Resource[] = await response.json();
        setResources(data);
      } catch (error) {
        console.error("Error fetching resources:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, []);

  const domains = [...new Set(resources.map((resource) => resource.field))];
  const fileTypes = [...new Set(resources.map((resource) => resource.type))];

  const filteredResources = resources.filter((resource) => {
    const matchesSearch = resource.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType =
      selectedType === "all" || resource.type === selectedType;
    const matchesDomain =
      selectedDomain === "all" || resource.field === selectedDomain;
    const matchesAccess =
      selectedAccess === "all" || resource.accessLevel === selectedAccess;
    const matchesFree = !showFreeOnly || resource.accessLevel === "free";

    return (
      matchesSearch &&
      matchesType &&
      matchesDomain &&
      matchesAccess &&
      matchesFree
    );
  });

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return "📄";
      case "doc":
        return "📝";
      case "guide":
        return "📋";
      case "project":
        return "🏗️";
      default:
        return "📄";
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case "pdf":
        return "bg-red-100 text-red-800 border-red-200";
      case "doc":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "guide":
        return "bg-green-100 text-green-800 border-green-200";
      case "project":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getAccessIcon = (access: string) => {
    switch (access) {
      case "free":
        return <Users className="h-4 w-4 text-green-600" />;
      case "member":
        return <Lock className="h-4 w-4 text-blue-600" />;
      case "paid":
        return <Crown className="h-4 w-4 text-purple-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getAccessLabel = (access: string) => {
    switch (access) {
      case "free":
        return "Miễn phí";
      case "member":
        return "Thành viên";
      case "paid":
        return "Trả phí";
      default:
        return "Khác";
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the filter effect
  };

  const ResourceCard = ({ resource }: { resource: Resource }) => (
    <Card className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-3">
          {/* File Type Badge */}
          <Badge
            variant="outline"
            className={`gap-1 ${getFileTypeColor(resource.type)}`}
          >
            <span className="text-sm">{getFileTypeIcon(resource.type)}</span>
            {resource.type.toUpperCase()}
          </Badge>

          {/* Access Badge */}
          <Badge
            variant="outline"
            className={`gap-1 ${getAccessBadgeColor(resource.accessLevel)}`}
          >
            {getAccessIcon(resource.accessLevel)}
            {getAccessLabel(resource.accessLevel)}
          </Badge>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
          {resource.title}
        </h3>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Meta Info */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
          <div className="flex items-center gap-1">
            <Tag className="h-4 w-4" />
            <span>{resource.field}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{resource.year}</span>
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {resource.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" asChild>
            <Link to={`/tai-lieu/${resource.slug}`}>
              <Eye className="h-4 w-4 mr-1" />
              Xem trước
            </Link>
          </Button>
          <Button
            size="sm"
            className="flex-1 bg-blue-600 hover:bg-blue-700"
            disabled={resource.accessLevel === "premium"}
            asChild={resource.accessLevel !== "premium"}
          >
            {resource.accessLevel === "premium" ? (
              <>
                <Crown className="h-4 w-4 mr-1" />
                Trả phí
              </>
            ) : (
              <Link to={`/tai-lieu/${resource.slug}/download`}>
                <Download className="h-4 w-4 mr-1" />
                Tải về
              </Link>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const LoadingSkeleton = () => (
    <Card className="overflow-hidden">
      <CardHeader>
        <div className="flex justify-between mb-3">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-6 w-16" />
        </div>
        <Skeleton className="h-6 w-full" />
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-3">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex gap-1 mb-4">
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-16" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className={`py-16 bg-background ${className}`}>
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Thư Viện Tài Liệu
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Kho tài liệu phong phú với các giáo trình, đồ án, luận văn và tài
            liệu chuyên ngành
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <form onSubmit={handleSearch}>
              <Input
                type="text"
                placeholder="Tìm kiếm tài liệu..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-3 w-full"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            </form>
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap justify-center gap-4">
            {/* File Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Loại file:</span>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {fileTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Domain Filter */}
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Lĩnh vực:</span>
              <Select value={selectedDomain} onValueChange={setSelectedDomain}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  {domains.map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {domain}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Access Filter */}
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Truy cập:</span>
              <Select value={selectedAccess} onValueChange={setSelectedAccess}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Tất cả" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả</SelectItem>
                  <SelectItem value="free">Miễn phí</SelectItem>
                  <SelectItem value="member">Thành viên</SelectItem>
                  <SelectItem value="paid">Trả phí</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Free Only Checkbox */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="free-only"
                checked={showFreeOnly}
                onCheckedChange={(checked) => setShowFreeOnly(checked === true)}
              />
              <label
                htmlFor="free-only"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Chỉ miễn phí
              </label>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-center">
          <p className="text-muted-foreground">
            Tìm thấy{" "}
            <span className="font-semibold text-blue-600">
              {filteredResources.length}
            </span>{" "}
            tài liệu
          </p>
        </div>

        {/* Resources Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <LoadingSkeleton key={i} />
            ))}
          </div>
        ) : filteredResources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              Không tìm thấy tài liệu
            </h3>
            <p className="text-muted-foreground">
              Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
            </p>
          </div>
        )}

        {/* Load More Button */}
        {!loading && filteredResources.length > 0 && (
          <div className="text-center">
            <Button variant="outline" size="lg" className="px-8 py-3" asChild>
              <Link to="/thu-vien">Xem thêm tài liệu</Link>
            </Button>
          </div>
        )}

        {/* Upload CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 text-center border border-blue-100">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Chia Sẻ Tài Liệu Của Bạn
            </h3>
            <p className="text-lg text-muted-foreground mb-6">
              Có tài liệu chất lượng? Chia sẻ với cộng đồng và nhận điểm thưởng
            </p>
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 font-semibold"
            >
              Tải lên tài liệu
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
