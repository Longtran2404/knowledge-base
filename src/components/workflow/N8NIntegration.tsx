/**
 * N8N Workflow Integration Component
 * Tích hợp hệ thống workflow automation với N8N
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Workflow,
  Play,
  Pause,
  Square,
  Settings,
  Plus,
  Edit,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  GitBranch,
  Database,
  Mail,
  MessageSquare,
  Calendar,
  FileText,
  Upload,
  Download,
  Eye,
  BarChart3,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Alert, AlertDescription } from '../ui/alert';
import { useAuth } from '../../contexts/UnifiedAuthContext';
import { toast } from 'sonner';

interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'condition' | 'webhook';
  name: string;
  description: string;
  config: Record<string, any>;
  position: { x: number; y: number };
}

interface WorkflowItem {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'error';
  nodes: WorkflowNode[];
  createdAt: string;
  lastRun?: string;
  runCount: number;
  successRate: number;
}

const predefinedWorkflows = [
  {
    id: 'email-welcome',
    name: 'Email chào mừng người dùng mới',
    description: 'Tự động gửi email chào mừng khi có người dùng đăng ký',
    category: 'Email Marketing',
    icon: Mail,
    trigger: 'user_registration',
    actions: ['send_email', 'add_to_crm']
  },
  {
    id: 'course-completion',
    name: 'Thông báo hoàn thành khóa học',
    description: 'Gửi thông báo và cấp chứng chỉ khi học viên hoàn thành khóa học',
    category: 'Education',
    icon: CheckCircle,
    trigger: 'course_completed',
    actions: ['generate_certificate', 'send_notification', 'update_progress']
  },
  {
    id: 'file-backup',
    name: 'Backup tự động tài liệu',
    description: 'Tự động backup các tài liệu quan trọng lên cloud storage',
    category: 'Data Management',
    icon: Database,
    trigger: 'file_uploaded',
    actions: ['backup_to_cloud', 'create_thumbnail', 'index_content']
  },
  {
    id: 'payment-processing',
    name: 'Xử lý thanh toán',
    description: 'Tự động xử lý đơn hàng và cấp quyền truy cập sau khi thanh toán',
    category: 'E-commerce',
    icon: Zap,
    trigger: 'payment_received',
    actions: ['grant_access', 'send_receipt', 'update_inventory']
  },
  {
    id: 'content-moderation',
    name: 'Kiểm duyệt nội dung tự động',
    description: 'Tự động kiểm tra và duyệt nội dung upload bằng AI',
    category: 'Content',
    icon: FileText,
    trigger: 'content_uploaded',
    actions: ['ai_content_check', 'copyright_check', 'approve_or_reject']
  },
  {
    id: 'social-sharing',
    name: 'Chia sẻ tự động lên mạng xã hội',
    description: 'Tự động đăng bài lên các mạng xã hội khi có nội dung mới',
    category: 'Social Media',
    icon: MessageSquare,
    trigger: 'content_published',
    actions: ['post_to_facebook', 'post_to_twitter', 'post_to_linkedin']
  }
];

export default function N8NIntegration() {
  const { userProfile } = useAuth();
  const [workflows, setWorkflows] = useState<WorkflowItem[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowItem | null>(null);
  const [currentTab, setCurrentTab] = useState('templates');
  const [isCreating, setIsCreating] = useState(false);
  const [workflowStats, setWorkflowStats] = useState({
    totalRuns: 1247,
    successRate: 94.2,
    avgExecutionTime: 2.3,
    activeWorkflows: 8
  });

  const isAdmin = userProfile?.role === 'admin';

  useEffect(() => {
    // Load existing workflows
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    // Simulate loading workflows
    const mockWorkflows: WorkflowItem[] = [
      {
        id: '1',
        name: 'Welcome Email Sequence',
        description: 'Gửi chuỗi email chào mừng cho người dùng mới',
        status: 'active',
        nodes: [],
        createdAt: '2025-01-15',
        lastRun: '2025-01-17 10:30',
        runCount: 45,
        successRate: 98.5
      },
      {
        id: '2',
        name: 'Course Completion Notification',
        description: 'Thông báo khi học viên hoàn thành khóa học',
        status: 'active',
        nodes: [],
        createdAt: '2025-01-10',
        lastRun: '2025-01-17 09:15',
        runCount: 23,
        successRate: 100
      },
      {
        id: '3',
        name: 'File Processing Pipeline',
        description: 'Xử lý tự động các file upload',
        status: 'inactive',
        nodes: [],
        createdAt: '2025-01-05',
        runCount: 156,
        successRate: 92.1
      }
    ];
    setWorkflows(mockWorkflows);
  };

  const createWorkflowFromTemplate = (template: any) => {
    const newWorkflow: WorkflowItem = {
      id: Date.now().toString(),
      name: template.name,
      description: template.description,
      status: 'inactive',
      nodes: [
        {
          id: 'trigger-1',
          type: 'trigger',
          name: 'Trigger',
          description: template.trigger,
          config: {},
          position: { x: 100, y: 100 }
        },
        ...template.actions.map((action: string, index: number) => ({
          id: `action-${index + 1}`,
          type: 'action',
          name: action.replace('_', ' '),
          description: action,
          config: {},
          position: { x: 300 + index * 200, y: 100 }
        }))
      ],
      createdAt: new Date().toISOString().split('T')[0],
      runCount: 0,
      successRate: 0
    };

    setWorkflows(prev => [...prev, newWorkflow]);
    setSelectedWorkflow(newWorkflow);
    setCurrentTab('editor');
    toast.success('Workflow đã được tạo từ template!');
  };

  const toggleWorkflowStatus = (id: string) => {
    setWorkflows(prev => prev.map(workflow =>
      workflow.id === id
        ? { ...workflow, status: workflow.status === 'active' ? 'inactive' : 'active' }
        : workflow
    ));
    toast.success('Đã cập nhật trạng thái workflow');
  };

  const deleteWorkflow = (id: string) => {
    setWorkflows(prev => prev.filter(workflow => workflow.id !== id));
    if (selectedWorkflow?.id === id) {
      setSelectedWorkflow(null);
    }
    toast.success('Đã xóa workflow');
  };

  const executeWorkflow = (id: string) => {
    toast.success('Đang thực thi workflow...');
    setTimeout(() => {
      toast.success('Workflow đã thực thi thành công!');
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive': return <Pause className="h-4 w-4 text-gray-500" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (!isAdmin) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Quyền truy cập bị hạn chế</h3>
          <p className="text-gray-600">
            Chỉ quản trị viên mới có thể truy cập hệ thống workflow N8N
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Workflow className="h-8 w-8 text-blue-600" />
            N8N Workflow Automation
          </h1>
          <p className="text-gray-600 mt-1">
            Tự động hóa quy trình làm việc với công cụ workflow mạnh mẽ
          </p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tạo Workflow mới
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tổng số lần chạy</p>
                <p className="text-2xl font-bold">{workflowStats.totalRuns.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Tỷ lệ thành công</p>
                <p className="text-2xl font-bold">{workflowStats.successRate}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Thời gian trung bình</p>
                <p className="text-2xl font-bold">{workflowStats.avgExecutionTime}s</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Workflows hoạt động</p>
                <p className="text-2xl font-bold">{workflowStats.activeWorkflows}</p>
              </div>
              <Workflow className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={currentTab} onValueChange={setCurrentTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="workflows">My Workflows</TabsTrigger>
          <TabsTrigger value="editor">Editor</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {predefinedWorkflows.map((template) => (
              <motion.div
                key={template.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Card className="cursor-pointer hover:shadow-lg transition-all duration-300">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <template.icon className="h-5 w-5 text-blue-600" />
                      {template.name}
                    </CardTitle>
                    <Badge variant="outline">{template.category}</Badge>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 mb-4">{template.description}</p>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        {template.actions.length + 1} nodes
                      </div>
                      <Button
                        size="sm"
                        onClick={() => createWorkflowFromTemplate(template)}
                      >
                        Sử dụng Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-4">
          {workflows.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <Workflow className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Chưa có workflow nào
                </h3>
                <p className="text-gray-600 mb-4">
                  Bắt đầu bằng cách tạo workflow từ template
                </p>
                <Button onClick={() => setCurrentTab('templates')}>
                  Xem Templates
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {workflows.map((workflow) => (
                <Card key={workflow.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getStatusIcon(workflow.status)}
                        <div>
                          <h3 className="font-semibold">{workflow.name}</h3>
                          <p className="text-sm text-gray-600">{workflow.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>Tạo: {workflow.createdAt}</span>
                            <span>Chạy: {workflow.runCount} lần</span>
                            <span>Thành công: {workflow.successRate}%</span>
                            {workflow.lastRun && <span>Lần cuối: {workflow.lastRun}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(workflow.status)}>
                          {workflow.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => executeWorkflow(workflow.id)}
                          disabled={workflow.status !== 'active'}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedWorkflow(workflow);
                            setCurrentTab('editor');
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleWorkflowStatus(workflow.id)}
                        >
                          {workflow.status === 'active' ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteWorkflow(workflow.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="editor" className="space-y-4">
          {selectedWorkflow ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Edit className="h-5 w-5" />
                  Chỉnh sửa: {selectedWorkflow.name}
                </CardTitle>
                <CardDescription>
                  Thiết kế workflow với giao diện kéo thả trực quan
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 min-h-[400px] bg-gray-50">
                  <div className="text-center text-gray-500">
                    <GitBranch className="h-12 w-12 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Workflow Editor</h3>
                    <p>Giao diện visual workflow editor sẽ được tích hợp tại đây</p>
                    <p className="text-sm mt-2">Kết nối với N8N API để chỉnh sửa workflow</p>
                  </div>
                </div>

                <div className="flex justify-between">
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Export
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline">Hủy</Button>
                    <Button>Lưu Workflow</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-8">
                <Edit className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Chọn workflow để chỉnh sửa
                </h3>
                <p className="text-gray-600">
                  Chọn một workflow từ danh sách hoặc tạo mới từ template
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Execution Logs
              </CardTitle>
              <CardDescription>
                Theo dõi lịch sử thực thi và debug workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Sample log entries */}
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Welcome Email Sequence</span>
                    </div>
                    <span className="text-sm text-gray-500">2 phút trước</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Đã gửi email chào mừng cho user_123@example.com
                  </p>
                  <div className="text-xs text-gray-500">
                    Execution time: 1.2s • Node: send_email
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="font-medium">File Processing Pipeline</span>
                    </div>
                    <span className="text-sm text-gray-500">15 phút trước</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Lỗi khi upload file lên cloud storage
                  </p>
                  <div className="text-xs text-gray-500">
                    Error: Connection timeout • Node: backup_to_cloud
                  </div>
                </div>

                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="font-medium">Course Completion Notification</span>
                    </div>
                    <span className="text-sm text-gray-500">1 giờ trước</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Đã cấp chứng chỉ cho học viên hoàn thành React cơ bản
                  </p>
                  <div className="text-xs text-gray-500">
                    Execution time: 3.4s • Node: generate_certificate
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* N8N Connection Status */}
      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          <strong>Kết nối N8N:</strong> Sẵn sàng • Server: https://n8n.namlongcenter.com •
          Version: 1.68.0 • Uptime: 99.9%
        </AlertDescription>
      </Alert>
    </div>
  );
}