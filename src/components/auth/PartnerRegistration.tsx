/**
 * Partner Registration Component
 * Form đăng ký dành cho đối tác doanh nghiệp
 */

import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Building2,
  Users,
  Mail,
  Phone,
  Globe,
  MapPin,
  FileText,
  ArrowLeft,
  Check,
  AlertCircle,
  Upload,
  Shield,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Checkbox } from "../ui/checkbox";
import { Separator } from "../ui/separator";

interface PartnerRegistrationData {
  // Company Info
  companyName: string;
  companyType: string;
  businessLicense: string;
  taxCode: string;
  foundedYear: string;
  employeeCount: string;
  website: string;

  // Contact Info
  contactPersonName: string;
  contactPersonTitle: string;
  contactEmail: string;
  contactPhone: string;

  // Address
  address: string;
  city: string;
  district: string;

  // Business Info
  businessDescription: string;
  partnershipGoals: string;
  expectedRevenue: string;

  // Legal
  agreeToTerms: boolean;
  agreeToDataProcessing: boolean;
}

interface PartnerRegistrationProps {
  onBack: () => void;
  onSubmit: (data: PartnerRegistrationData) => void;
  loading?: boolean;
}

const companyTypes = [
  { value: "ltd", label: "Công ty TNHH" },
  { value: "jsc", label: "Công ty Cổ phần" },
  { value: "private", label: "Doanh nghiệp tư nhân" },
  { value: "startup", label: "Startup" },
  { value: "other", label: "Khác" },
];

const employeeCounts = [
  { value: "1-10", label: "1-10 nhân viên" },
  { value: "11-50", label: "11-50 nhân viên" },
  { value: "51-200", label: "51-200 nhân viên" },
  { value: "201-500", label: "201-500 nhân viên" },
  { value: "500+", label: "Trên 500 nhân viên" },
];

const revenueRanges = [
  { value: "under-1b", label: "Dưới 1 tỷ VNĐ/năm" },
  { value: "1b-5b", label: "1-5 tỷ VNĐ/năm" },
  { value: "5b-20b", label: "5-20 tỷ VNĐ/năm" },
  { value: "20b-100b", label: "20-100 tỷ VNĐ/năm" },
  { value: "over-100b", label: "Trên 100 tỷ VNĐ/năm" },
];

export const PartnerRegistration: React.FC<PartnerRegistrationProps> = ({
  onBack,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<PartnerRegistrationData>({
    companyName: "",
    companyType: "",
    businessLicense: "",
    taxCode: "",
    foundedYear: "",
    employeeCount: "",
    website: "",
    contactPersonName: "",
    contactPersonTitle: "",
    contactEmail: "",
    contactPhone: "",
    address: "",
    city: "",
    district: "",
    businessDescription: "",
    partnershipGoals: "",
    expectedRevenue: "",
    agreeToTerms: false,
    agreeToDataProcessing: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    field: keyof PartnerRegistrationData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.companyName)
      newErrors.companyName = "Tên công ty là bắt buộc";
    if (!formData.companyType)
      newErrors.companyType = "Loại hình doanh nghiệp là bắt buộc";
    if (!formData.businessLicense)
      newErrors.businessLicense = "Số giấy phép kinh doanh là bắt buộc";
    if (!formData.taxCode) newErrors.taxCode = "Mã số thuế là bắt buộc";
    if (!formData.contactPersonName)
      newErrors.contactPersonName = "Tên người liên hệ là bắt buộc";
    if (!formData.contactEmail) newErrors.contactEmail = "Email là bắt buộc";
    if (!formData.contactPhone)
      newErrors.contactPhone = "Số điện thoại là bắt buộc";
    if (!formData.businessDescription)
      newErrors.businessDescription = "Mô tả doanh nghiệp là bắt buộc";
    if (!formData.agreeToTerms)
      newErrors.agreeToTerms = "Bạn cần đồng ý với điều khoản dịch vụ";
    if (!formData.agreeToDataProcessing)
      newErrors.agreeToDataProcessing = "Bạn cần đồng ý xử lý dữ liệu cá nhân";

    // Email validation
    if (formData.contactEmail && !/\S+@\S+\.\S+/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Email không hợp lệ";
    }

    // Phone validation
    if (
      formData.contactPhone &&
      !/^[0-9]{10,11}$/.test(formData.contactPhone.replace(/\s/g, ""))
    ) {
      newErrors.contactPhone = "Số điện thoại không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Đăng ký Đối tác</h2>
          <p className="text-gray-600">
            Trở thành đối tác chiến lược của Knowledge Base
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>Thông tin doanh nghiệp</span>
            </CardTitle>
            <CardDescription>
              Cung cấp thông tin cơ bản về công ty của bạn
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Tên công ty *</Label>
                <Input
                  id="companyName"
                  value={formData.companyName}
                  onChange={(e) =>
                    handleInputChange("companyName", e.target.value)
                  }
                  placeholder="Nhập tên công ty"
                  className={errors.companyName ? "border-red-500" : ""}
                />
                {errors.companyName && (
                  <p className="text-sm text-red-500">{errors.companyName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyType">Loại hình doanh nghiệp *</Label>
                <Select
                  value={formData.companyType}
                  onValueChange={(value) =>
                    handleInputChange("companyType", value)
                  }
                >
                  <SelectTrigger
                    className={errors.companyType ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Chọn loại hình" />
                  </SelectTrigger>
                  <SelectContent>
                    {companyTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.companyType && (
                  <p className="text-sm text-red-500">{errors.companyType}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessLicense">
                  Số giấy phép kinh doanh *
                </Label>
                <Input
                  id="businessLicense"
                  value={formData.businessLicense}
                  onChange={(e) =>
                    handleInputChange("businessLicense", e.target.value)
                  }
                  placeholder="Nhập số giấy phép"
                  className={errors.businessLicense ? "border-red-500" : ""}
                />
                {errors.businessLicense && (
                  <p className="text-sm text-red-500">
                    {errors.businessLicense}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxCode">Mã số thuế *</Label>
                <Input
                  id="taxCode"
                  value={formData.taxCode}
                  onChange={(e) => handleInputChange("taxCode", e.target.value)}
                  placeholder="Nhập mã số thuế"
                  className={errors.taxCode ? "border-red-500" : ""}
                />
                {errors.taxCode && (
                  <p className="text-sm text-red-500">{errors.taxCode}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="foundedYear">Năm thành lập</Label>
                <Input
                  id="foundedYear"
                  type="number"
                  value={formData.foundedYear}
                  onChange={(e) =>
                    handleInputChange("foundedYear", e.target.value)
                  }
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeCount">Số lượng nhân viên</Label>
                <Select
                  value={formData.employeeCount}
                  onValueChange={(value) =>
                    handleInputChange("employeeCount", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn quy mô" />
                  </SelectTrigger>
                  <SelectContent>
                    {employeeCounts.map((count) => (
                      <SelectItem key={count.value} value={count.value}>
                        {count.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange("website", e.target.value)}
                  placeholder="https://company.com"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Thông tin liên hệ</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPersonName">Tên người liên hệ *</Label>
                <Input
                  id="contactPersonName"
                  value={formData.contactPersonName}
                  onChange={(e) =>
                    handleInputChange("contactPersonName", e.target.value)
                  }
                  placeholder="Nguyễn Văn A"
                  className={errors.contactPersonName ? "border-red-500" : ""}
                />
                {errors.contactPersonName && (
                  <p className="text-sm text-red-500">
                    {errors.contactPersonName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPersonTitle">Chức vụ</Label>
                <Input
                  id="contactPersonTitle"
                  value={formData.contactPersonTitle}
                  onChange={(e) =>
                    handleInputChange("contactPersonTitle", e.target.value)
                  }
                  placeholder="Giám đốc, CEO, ..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Email *</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) =>
                    handleInputChange("contactEmail", e.target.value)
                  }
                  placeholder="contact@company.com"
                  className={errors.contactEmail ? "border-red-500" : ""}
                />
                {errors.contactEmail && (
                  <p className="text-sm text-red-500">{errors.contactEmail}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Số điện thoại *</Label>
                <Input
                  id="contactPhone"
                  value={formData.contactPhone}
                  onChange={(e) =>
                    handleInputChange("contactPhone", e.target.value)
                  }
                  placeholder="0123456789"
                  className={errors.contactPhone ? "border-red-500" : ""}
                />
                {errors.contactPhone && (
                  <p className="text-sm text-red-500">{errors.contactPhone}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Business Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Chi tiết kinh doanh</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessDescription">Mô tả doanh nghiệp *</Label>
              <Textarea
                id="businessDescription"
                value={formData.businessDescription}
                onChange={(e) =>
                  handleInputChange("businessDescription", e.target.value)
                }
                placeholder="Mô tả ngắn gọn về lĩnh vực kinh doanh, sản phẩm/dịch vụ chính..."
                rows={4}
                className={errors.businessDescription ? "border-red-500" : ""}
              />
              {errors.businessDescription && (
                <p className="text-sm text-red-500">
                  {errors.businessDescription}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="partnershipGoals">Mục tiêu hợp tác</Label>
              <Textarea
                id="partnershipGoals"
                value={formData.partnershipGoals}
                onChange={(e) =>
                  handleInputChange("partnershipGoals", e.target.value)
                }
                placeholder="Mô tả mục tiêu và kỳ vọng từ việc hợp tác với Knowledge Base..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expectedRevenue">Doanh thu dự kiến</Label>
              <Select
                value={formData.expectedRevenue}
                onValueChange={(value) =>
                  handleInputChange("expectedRevenue", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn khoảng doanh thu" />
                </SelectTrigger>
                <SelectContent>
                  {revenueRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Legal Agreement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Điều khoản và Chính sách</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) =>
                    handleInputChange("agreeToTerms", !!checked)
                  }
                />
                <Label
                  htmlFor="agreeToTerms"
                  className="text-sm leading-relaxed"
                >
                  Tôi đồng ý với{" "}
                  <Link to="/terms" className="text-primary hover:underline">
                    Điều khoản dịch vụ
                  </Link>{" "}
                  và{" "}
                  <Link
                    to="/partner-policy"
                    className="text-primary hover:underline"
                  >
                    Chính sách đối tác
                  </Link>{" "}
                  của Knowledge Base *
                </Label>
              </div>
              {errors.agreeToTerms && (
                <p className="text-sm text-red-500 ml-6">
                  {errors.agreeToTerms}
                </p>
              )}

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToDataProcessing"
                  checked={formData.agreeToDataProcessing}
                  onCheckedChange={(checked) =>
                    handleInputChange("agreeToDataProcessing", !!checked)
                  }
                />
                <Label
                  htmlFor="agreeToDataProcessing"
                  className="text-sm leading-relaxed"
                >
                  Tôi đồng ý cho Knowledge Base xử lý dữ liệu cá nhân theo{" "}
                  <Link to="/privacy" className="text-primary hover:underline">
                    Chính sách bảo mật
                  </Link>{" "}
                  *
                </Label>
              </div>
              {errors.agreeToDataProcessing && (
                <p className="text-sm text-red-500 ml-6">
                  {errors.agreeToDataProcessing}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <Card>
          <CardContent className="pt-6">
            <Button
              type="submit"
              className="w-full"
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Gửi đơn đăng ký đối tác
                  <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </>
              )}
            </Button>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-700">
                  <strong>Lưu ý:</strong> Đơn đăng ký sẽ được xem xét trong vòng
                  3-5 ngày làm việc. Chúng tôi sẽ liên hệ với bạn qua email hoặc
                  điện thoại để thảo luận chi tiết về hợp tác.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
};

export default PartnerRegistration;
