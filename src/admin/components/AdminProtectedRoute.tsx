import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuthStore } from '../stores/adminAuth.store';
import { useEffect } from 'react';

export function AdminProtectedRoute() {
  const { adminUser, isLoading, initializeAdmin } = useAdminAuthStore();

  useEffect(() => {
    initializeAdmin();
  }, [initializeAdmin]);

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-admin-deep-forest border-t-transparent" />
      </div>
    );
  }

  // Check if user is an admin
  if (!adminUser) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
