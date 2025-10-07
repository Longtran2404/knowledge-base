import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/UnifiedAuthContext";
import { Loading } from "../ui/loading";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: ("sinh_vien" | "giang_vien" | "quan_ly" | "admin")[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  redirectTo = "/dang-nhap",
  allowedRoles,
}) => {
  const { userProfile: user, isAuthenticated, isLoading, error } = useAuth();
  const location = useLocation();

  console.log("ProtectedRoute check:", {
    isLoading,
    isAuthenticated,
    user: user?.email,
    error,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Loading size="lg" text="Đang kiểm tra quyền truy cập..." />
      </div>
    );
  }

  // Check authentication requirement
  if (requireAuth && !isAuthenticated) {
    console.log("User not authenticated, redirecting to:", redirectTo);
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role permissions if specified
  if (allowedRoles && user && !allowedRoles.includes(user.account_role)) {
    // Store error message for display
    localStorage.setItem(
      "nlc_auth_error",
      "Bạn không có quyền truy cập trang này"
    );
    return <Navigate to="/dang-nhap" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

// Specific route components for different access levels
export const StudentRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ProtectedRoute allowedRoles={["sinh_vien"]}>{children}</ProtectedRoute>
  );
};

export const InstructorRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return (
    <ProtectedRoute allowedRoles={["giang_vien", "admin"]}>
      {children}
    </ProtectedRoute>
  );
};

export const ManagerRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>;
};

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  return <ProtectedRoute allowedRoles={["admin"]}>{children}</ProtectedRoute>;
};

export default ProtectedRoute;
