/**
 * Auth Persistence Indicator Component
 * Hiển thị trạng thái lưu trữ phiên đăng nhập và thông tin user gần đây
 */

import React, { useState, useEffect } from 'react';
import { authPersistence } from '../../lib/auth-persistence';
import { useAuth } from '../../contexts/UnifiedAuthContext';

interface AuthPersistenceIndicatorProps {
  showLastUser?: boolean;
  className?: string;
}

export const AuthPersistenceIndicator: React.FC<AuthPersistenceIndicatorProps> = ({
  showLastUser = true,
  className = ''
}) => {
  const { isAuthenticated, user } = useAuth();
  const [lastUserData, setLastUserData] = useState<any>(null);
  const [hasStoredSession, setHasStoredSession] = useState(false);

  useEffect(() => {
    const checkStoredData = async () => {
      // Check if there's stored session data
      const storedAuth = await authPersistence.restoreAuthData();
      setHasStoredSession(!!storedAuth);

      // Get last user data for display
      const userData = authPersistence.getLastUserData();
      setLastUserData(userData);
    };

    if (!isAuthenticated) {
      checkStoredData();
    }
  }, [isAuthenticated]);

  if (isAuthenticated) {
    return (
      <div className={`flex items-center gap-2 text-sm text-green-600 ${className}`}>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
        <span>Đã đăng nhập - Phiên làm việc được lưu tự động</span>
      </div>
    );
  }

  if (!showLastUser || !lastUserData) {
    return null;
  }

  return (
    <div className={`space-y-2 ${className}`}>
      {hasStoredSession && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span>Phiên đăng nhập được lưu trữ an toàn</span>
        </div>
      )}

      {lastUserData && (
        <div className="p-3 bg-gray-50 rounded-lg border">
          <div className="text-sm text-gray-600 mb-1">Người dùng gần đây:</div>
          <div className="font-medium text-gray-900">
            {lastUserData.fullName || lastUserData.email?.split('@')[0]}
          </div>
          <div className="text-xs text-gray-500">{lastUserData.email}</div>
          {hasStoredSession && (
            <div className="text-xs text-green-600 mt-1">
              ✓ Có thể đăng nhập lại tự động
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthPersistenceIndicator;