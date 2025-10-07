/**
 * Background Jobs Admin Component
 * Component admin để quản lý và monitor background jobs
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  Play,
  Pause,
  RefreshCw,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Activity,
  Timer,
  Database
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Separator } from '../ui/separator';
import { useBackgroundJobs } from '../../lib/background/init-background-jobs';

const BackgroundJobsAdmin: React.FC = () => {
  const { status, refreshStatus, runManualRenewal, updateConfig } = useBackgroundJobs();
  const [isLoading, setIsLoading] = useState(false);
  const [lastManualRun, setLastManualRun] = useState<any>(null);
  const [configForm, setConfigForm] = useState({
    enableRenewalJob: status.config.enableRenewalJob,
    checkIntervalMs: status.config.renewalJobConfig?.checkIntervalMs || 3600000,
    daysBeforeExpiry: status.config.renewalJobConfig?.daysBeforeExpiry || 3,
    maxRetryAttempts: status.config.renewalJobConfig?.maxRetryAttempts || 3
  });

  useEffect(() => {
    // Refresh status mỗi 30 giây
    const interval = setInterval(refreshStatus, 30000);
    return () => clearInterval(interval);
  }, [refreshStatus]);

  const handleManualRenewal = async () => {
    setIsLoading(true);
    try {
      const result = await runManualRenewal();
      setLastManualRun(result);
    } catch (error) {
      console.error('Manual renewal failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfigUpdate = () => {
    updateConfig({
      enableRenewalJob: configForm.enableRenewalJob,
      renewalJobConfig: {
        checkIntervalMs: configForm.checkIntervalMs,
        daysBeforeExpiry: configForm.daysBeforeExpiry,
        maxRetryAttempts: configForm.maxRetryAttempts
      }
    });
    refreshStatus();
  };

  const formatInterval = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    return `${minutes}m`;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Background Jobs</h1>
          <p className="text-gray-600">Quản lý và monitor các background jobs của hệ thống</p>
        </div>
        <Button onClick={refreshStatus} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Trạng thái hệ thống</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${status.isInitialized ? 'bg-green-100' : 'bg-red-100'}`}>
                {status.isInitialized ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-600" />
                )}
              </div>
              <div>
                <p className="font-medium">Background Jobs</p>
                <p className="text-sm text-gray-600">
                  {status.isInitialized ? 'Hoạt động' : 'Không hoạt động'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${status.renewalJob.isRunning ? 'bg-blue-100' : 'bg-gray-100'}`}>
                {status.renewalJob.isRunning ? (
                  <Play className="h-5 w-5 text-blue-600" />
                ) : (
                  <Pause className="h-5 w-5 text-gray-600" />
                )}
              </div>
              <div>
                <p className="font-medium">Renewal Job</p>
                <p className="text-sm text-gray-600">
                  {status.renewalJob.isRunning ? 'Đang chạy' : 'Đã dừng'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-purple-100">
                <Timer className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Check Interval</p>
                <p className="text-sm text-gray-600">
                  {formatInterval(status.config.renewalJobConfig?.checkIntervalMs || 3600000)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Renewal Job Details */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>Subscription Renewal Job</span>
            </CardTitle>
            <CardDescription>
              Tự động xử lý renewal cho các subscription Premium
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Trạng thái:</span>
                <Badge variant={status.renewalJob.isRunning ? 'default' : 'secondary'}>
                  {status.renewalJob.isRunning ? 'Running' : 'Stopped'}
                </Badge>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Check interval:</span>
                <span className="font-medium">
                  {formatInterval(status.renewalJob.config.checkIntervalMs)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Days before expiry:</span>
                <span className="font-medium">{status.renewalJob.config.daysBeforeExpiry} ngày</span>
              </div>

              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Max retry attempts:</span>
                <span className="font-medium">{status.renewalJob.config.maxRetryAttempts}</span>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button
                onClick={handleManualRenewal}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Đang chạy...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Chạy manual renewal
                  </>
                )}
              </Button>

              {lastManualRun && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gray-50 p-3 rounded-lg text-sm"
                >
                  <div className="font-medium mb-2">Kết quả lần chạy cuối:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>Checked: {lastManualRun.totalChecked}</div>
                    <div>Success: {lastManualRun.successfulRenewals}</div>
                    <div>Failed: {lastManualRun.failedRenewals}</div>
                    <div>Skipped: {lastManualRun.skippedRenewals}</div>
                  </div>
                  {lastManualRun.errors.length > 0 && (
                    <div className="mt-2 text-red-600">
                      <div className="font-medium">Errors:</div>
                      <ul className="list-disc list-inside">
                        {lastManualRun.errors.slice(0, 3).map((error: string, index: number) => (
                          <li key={index} className="text-xs">{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Cấu hình</span>
            </CardTitle>
            <CardDescription>
              Điều chỉnh các tham số của background jobs
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Renewal Job</Label>
                  <p className="text-sm text-gray-600">Bật/tắt renewal job</p>
                </div>
                <Switch
                  checked={configForm.enableRenewalJob}
                  onCheckedChange={(checked) =>
                    setConfigForm(prev => ({ ...prev, enableRenewalJob: checked }))
                  }
                />
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <Label>Check Interval (minutes)</Label>
                  <Input
                    type="number"
                    value={Math.floor(configForm.checkIntervalMs / 60000)}
                    onChange={(e) =>
                      setConfigForm(prev => ({
                        ...prev,
                        checkIntervalMs: parseInt(e.target.value) * 60000
                      }))
                    }
                    min={1}
                    max={1440}
                  />
                  <p className="text-xs text-gray-600">Khoảng thời gian check renewal (1-1440 phút)</p>
                </div>

                <div>
                  <Label>Days Before Expiry</Label>
                  <Input
                    type="number"
                    value={configForm.daysBeforeExpiry}
                    onChange={(e) =>
                      setConfigForm(prev => ({
                        ...prev,
                        daysBeforeExpiry: parseInt(e.target.value)
                      }))
                    }
                    min={1}
                    max={30}
                  />
                  <p className="text-xs text-gray-600">Số ngày trước khi hết hạn để bắt đầu renewal</p>
                </div>

                <div>
                  <Label>Max Retry Attempts</Label>
                  <Input
                    type="number"
                    value={configForm.maxRetryAttempts}
                    onChange={(e) =>
                      setConfigForm(prev => ({
                        ...prev,
                        maxRetryAttempts: parseInt(e.target.value)
                      }))
                    }
                    min={1}
                    max={10}
                  />
                  <p className="text-xs text-gray-600">Số lần retry tối đa khi renewal fail</p>
                </div>
              </div>

              <Button onClick={handleConfigUpdate} className="w-full">
                Cập nhật cấu hình
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environment Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Database className="h-5 w-5" />
            <span>Environment Info</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">NODE_ENV:</span>
              <div className="font-mono">{process.env.NODE_ENV || 'development'}</div>
            </div>
            <div>
              <span className="text-gray-600">Background Jobs:</span>
              <div className="font-mono">
                {process.env.REACT_APP_ENABLE_BACKGROUND_JOBS || 'false'}
              </div>
            </div>
            <div>
              <span className="text-gray-600">VNPay Mode:</span>
              <div className="font-mono">
                {process.env.REACT_APP_VNPAY_URL?.includes('sandbox') ? 'sandbox' : 'production'}
              </div>
            </div>
            <div>
              <span className="text-gray-600">Current Time:</span>
              <div className="font-mono">{new Date().toLocaleString('vi-VN')}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Warning */}
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
            <div className="text-sm text-yellow-700">
              <strong>Lưu ý:</strong> Background jobs chỉ chạy trong production environment hoặc khi
              REACT_APP_ENABLE_BACKGROUND_JOBS=true. Trong development, bạn có thể chạy manual renewal
              để test functionality.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BackgroundJobsAdmin;