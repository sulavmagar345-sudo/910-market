import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AdminLayout } from '../layouts/AdminLayout';

// Lazy loading admin pages
const AdminLoginPage = lazy(() => import('../pages/auth/AdminLoginPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const OrdersListPage = lazy(() => import('../pages/orders/OrdersListPage'));
const OrderDetailPage = lazy(() => import('../pages/orders/OrderDetailPage'));
const ProductsListPage = lazy(() => import('../pages/products/ProductsListPage'));
const ProductFormPage = lazy(() => import('../pages/products/ProductFormPage'));
const CustomersListPage = lazy(() => import('../pages/customers/CustomersListPage'));
const InventoryPage = lazy(() => import('../pages/inventory/InventoryPage'));
const SettingsPage = lazy(() => import('../pages/settings/SettingsPage'));
const CategoriesPage = lazy(() => import('../pages/categories/CategoriesPage'));
const BrandsPage = lazy(() => import('../pages/brands/BrandsPage'));
const ReviewsPage = lazy(() => import('../pages/reviews/ReviewsPage'));
const CouponsPage = lazy(() => import('../pages/coupons/CouponsPage'));
const DeliveryPage = lazy(() => import('../pages/delivery/DeliveryPage'));
const AnalyticsPage = lazy(() => import('../pages/analytics/AnalyticsPage'));
const ReportsPage = lazy(() => import('../pages/reports/ReportsPage'));
import { AdminProtectedRoute } from '../components/AdminProtectedRoute';

function LoadingSpinner() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-admin-deep-forest border-t-transparent" />
    </div>
  );
}

export function AdminRoutes() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="login" element={<AdminLoginPage />} />
        
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="orders" element={<OrdersListPage />} />
            <Route path="orders/:id" element={<OrderDetailPage />} />
            <Route path="products" element={<ProductsListPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
            <Route path="products/:id/edit" element={<ProductFormPage />} />
            <Route path="customers" element={<CustomersListPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="brands" element={<BrandsPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="coupons" element={<CouponsPage />} />
            <Route path="delivery" element={<DeliveryPage />} />
            <Route path="analytics" element={<AnalyticsPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}

