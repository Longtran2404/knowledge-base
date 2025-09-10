
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
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
  Crown
} from 'lucide-react';
import { Resource } from '@/lib/mockData';

interface ResourceLibraryProps {
  resources: Resource[];
}

const ResourceLibrary: React.FC<ResourceLibraryProps> = ({ resources }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedField, setSelectedField] = useState<string>('all');
  const [selectedAccess, setSelectedAccess] = useState<string>('all');

  const fileTypes = ['PDF', 'Doc', 'Video', 'Image'];
  const fields = [...new Set(resources.map(resource => resource.field))];
  const accessLevels = [
    { key: 'free', label: 'Miễn phí', color: 'green' },
    { key: 'member', label: 'Thành viên', color: 'blue' },
    { key: 'premium', label: 'Trả phí', color: 'purple' }
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          resource.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || resource.type === selectedType;
    const matchesField = selectedField === 'all' || resource.field === selectedField;
    const matchesAccess = selectedAccess === 'all' || resource.accessLevel === selectedAccess;
    
    return matchesSearch && matchesType && matchesField && matchesAccess;
  });

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return '📄';
      case 'Doc':
        return '📝';
      case 'Video':
        return '🎥';
      case 'Image':
        return '🖼️';
      default:
        return '📄';
    }
  };

  const getFileTypeColor = (type: string) => {
    switch (type) {
      case 'PDF':
        return 'bg-red-100 text-red-800';
      case 'Doc':
        return 'bg-blue-100 text-blue-800';
      case 'Video':
        return 'bg-purple-100 text-purple-800';
      case 'Image':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getAccessIcon = (accessLevel: string) => {
    switch (accessLevel) {
      case 'free':
        return <Users className="w-4 h-4 text-green-600" />;
      case 'member':
        return <Lock className="w-4 h-4 text-blue-600" />;
      case 'premium':
        return <Crown className="w-4 h-4 text-purple-600" />;
      default:
        return <Users className="w-4 h-4 text-gray-600" />;
    }
  };

  const getAccessColor = (accessLevel: string) => {
    switch (accessLevel) {
      case 'free':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'member':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'premium':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getAccessLabel = (accessLevel: string) => {
    switch (accessLevel) {
      case 'free':
        return 'Miễn phí';
      case 'member':
        return 'Thành viên';
      case 'premium':
        return 'Trả phí';
      default:
        return 'Khác';
    }
  };

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Thư Viện Tài Liệu
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Kho tài liệu phong phú với các giáo trình, đồ án, luận văn và tài liệu chuyên ngành
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search Bar */}
          <div className="relative max-w-md mx-auto">
            <Input
              type="text"
              placeholder="Tìm kiếm tài liệu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-3 w-full border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            {/* File Type Filter */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Loại file:</span>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                {fileTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Field Filter */}
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Lĩnh vực:</span>
              <select
                value={selectedField}
                onChange={(e) => setSelectedField(e.target.value)}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                {fields.map(field => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>

            {/* Access Level Filter */}
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Truy cập:</span>
              <select
                value={selectedAccess}
                onChange={(e) => setSelectedAccess(e.target.value)}
                className="px-3 py-1 border border-gray-200 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả</option>
                {accessLevels.map(access => (
                  <option key={access.key} value={access.key}>{access.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6 text-center">
          <p className="text-gray-600">
            Tìm thấy <span className="font-semibold text-blue-600">{filteredResources.length}</span> tài liệu
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {filteredResources.map((resource) => (
            <Card key={resource.id} className="group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
              {/* Resource Header */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-start justify-between mb-3">
                  {/* File Type Badge */}
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getFileTypeColor(resource.type)}`}>
                    <span className="text-sm">{getFileTypeIcon(resource.type)}</span>
                    {resource.type}
                  </span>

                  {/* Access Level Badge */}
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${getAccessColor(resource.accessLevel)}`}>
                    {getAccessIcon(resource.accessLevel)}
                    {getAccessLabel(resource.accessLevel)}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                  {resource.title}
                </h3>

                {/* Meta Info */}
                <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center gap-1">
                    <Tag className="w-4 h-4" />
                    <span>{resource.field}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{resource.year}</span>
                  </div>
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm line-clamp-2">
                  {resource.description}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="p-6">
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1 hover:bg-blue-50 hover:text-blue-600"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Xem trước
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1 bg-blue-600 hover:bg-blue-700"
                    disabled={resource.accessLevel === 'premium'}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    {resource.accessLevel === 'premium' ? 'Trả phí' : 'Tải về'}
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredResources.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Không tìm thấy tài liệu</h3>
            <p className="text-gray-600">Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
          </div>
        )}

        {/* Load More Button */}
        {filteredResources.length > 0 && (
          <div className="text-center">
            <Button 
              variant="outline" 
              size="lg"
              className="px-8 py-3 hover:bg-blue-50 hover:text-blue-600 hover:border-blue-600"
            >
              Xem thêm tài liệu
            </Button>
          </div>
        )}

        {/* Upload CTA */}
        <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 text-center border border-blue-100">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Chia Sẻ Tài Liệu Của Bạn</h3>
            <p className="text-lg text-gray-600 mb-6">
              Có tài liệu chất lượng? Chia sẻ với cộng đồng và nhận điểm thưởng
            </p>
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 font-semibold">
              Tải lên tài liệu
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ResourceLibrary;