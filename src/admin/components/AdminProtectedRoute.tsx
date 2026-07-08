import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export function AdminProtectedRoute() {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-admin-deep-forest border-t-transparent" />
      </div>
    );
  }

  // Check if authenticated and has admin-like role
  const isAdmin = user && ['superadmin', 'admin', 'manager', 'support'].includes(user.role || '');

  if (!isAdmin) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
