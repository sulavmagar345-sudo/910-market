// ─── Admin User & Auth ─────────────────────────────────────────────────────

export type AdminRole =
  | 'super_admin'
  | 'manager'
  | 'inventory_manager'
  | 'order_manager'
  | 'customer_support'
  | 'delivery_manager';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  avatar?: string;
  phone?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

// ─── Product ───────────────────────────────────────────────────────────────

export type ProductStatus = 'published' | 'draft' | 'archived';

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription: string;
  sku: string;
  barcode?: string;
  price: number;
  comparePrice?: number;
  discountPercent?: number;
  taxRate: number;
  stock: number;
  lowStockThreshold: number;
  volume: string; // e.g. "750 ML"
  alcoholPercent?: number;
  categoryId: string;
  categoryName: string;
  brandId: string;
  brandName: string;
  images: ProductImage[];
  status: ProductStatus;
  isFeatured: boolean;
  seoTitle?: string;
  seoDescription?: string;
  seoKeywords?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Category ──────────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  parentName?: string;
  isFeatured: boolean;
  sortOrder: number;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Brand ─────────────────────────────────────────────────────────────────

export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  website?: string;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Order ─────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'refunded';

export type PaymentMethod = 'cash_on_delivery' | 'esewa' | 'khalti' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productImage?: string;
  sku: string;
  price: number;
  quantity: number;
  total: number;
}

export interface OrderAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  province: string;
}

export interface OrderTimeline {
  status: OrderStatus;
  note?: string;
  timestamp: string;
  by?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerEmail?: string;
  customerPhone: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  items: OrderItem[];
  shippingAddress: OrderAddress;
  subtotal: number;
  deliveryCharge: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  timeline: OrderTimeline[];
  createdAt: string;
  updatedAt: string;
}

// ─── Customer ──────────────────────────────────────────────────────────────

export type CustomerStatus = 'active' | 'inactive' | 'blocked';

export interface CustomerAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  province: string;
  isDefault: boolean;
}

export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone: string;
  avatar?: string;
  status: CustomerStatus;
  totalOrders: number;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderAt?: string;
  addresses: CustomerAddress[];
  createdAt: string;
  updatedAt: string;
}

// ─── Inventory ─────────────────────────────────────────────────────────────

export type InventoryAdjustmentType = 'add' | 'remove' | 'set';

export interface InventoryItem {
  productId: string;
  productName: string;
  sku: string;
  categoryName: string;
  brandName: string;
  currentStock: number;
  lowStockThreshold: number;
  status: 'in_stock' | 'low_stock' | 'out_of_stock';
  lastUpdated: string;
}

export interface InventoryAdjustment {
  id: string;
  productId: string;
  productName: string;
  type: InventoryAdjustmentType;
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string;
  adjustedBy: string;
  adjustedAt: string;
}

// ─── Review ────────────────────────────────────────────────────────────────

export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface Review {
  id: string;
  productId: string;
  productName: string;
  customerId: string;
  customerName: string;
  rating: number;
  title: string;
  body: string;
  status: ReviewStatus;
  adminReply?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Coupon ────────────────────────────────────────────────────────────────

export type CouponType = 'percentage' | 'fixed';
export type CouponStatus = 'active' | 'inactive' | 'expired';

export interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: string;
  status: CouponStatus;
  description?: string;
  totalRevenue: number;
  createdAt: string;
  updatedAt: string;
}

// ─── Delivery ──────────────────────────────────────────────────────────────

export interface DeliveryArea {
  id: string;
  name: string;
  district: string;
  province: string;
  deliveryCharge: number;
  estimatedTime: string; // e.g. "1-2 hours"
  isActive: boolean;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  licensePlate: string;
  isActive: boolean;
  currentOrders: number;
  totalDeliveries: number;
  rating: number;
}

// ─── Analytics ─────────────────────────────────────────────────────────────

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  orders: number;
}

export interface ProductPerformance {
  productId: string;
  productName: string;
  unitsSold: number;
  revenue: number;
  growth: number;
}

export interface CategoryPerformance {
  categoryId: string;
  categoryName: string;
  unitsSold: number;
  revenue: number;
  percentage: number;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  revenueGrowth: number;
  totalOrders: number;
  ordersGrowth: number;
  totalCustomers: number;
  customersGrowth: number;
  averageOrderValue: number;
  aovGrowth: number;
  conversionRate: number;
  conversionGrowth: number;
  totalVisitors: number;
  visitorsGrowth: number;
}

// ─── Staff ─────────────────────────────────────────────────────────────────

export interface StaffPermissions {
  viewDashboard: boolean;
  manageProducts: boolean;
  manageOrders: boolean;
  manageCustomers: boolean;
  manageInventory: boolean;
  manageReviews: boolean;
  manageCoupons: boolean;
  manageDelivery: boolean;
  viewAnalytics: boolean;
  manageStaff: boolean;
  manageSettings: boolean;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: AdminRole;
  permissions: StaffPermissions;
  isActive: boolean;
  avatar?: string;
  lastLogin?: string;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  staffId: string;
  staffName: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: string;
  ip?: string;
  timestamp: string;
}

// ─── Settings ──────────────────────────────────────────────────────────────

export interface StoreSettings {
  storeName: string;
  storeTagline: string;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  logoUrl?: string;
  faviconUrl?: string;
  currency: string;
  currencySymbol: string;
  timezone: string;
  language: string;
}

export interface BusinessHours {
  day: string;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

export interface TaxSettings {
  vatEnabled: boolean;
  vatRate: number;
  vatRegistrationNumber?: string;
  panNumber?: string;
}

export interface PaymentSettings {
  cashOnDelivery: boolean;
  eSewa: boolean;
  eSewaId?: string;
  khalti: boolean;
  khaltiPublicKey?: string;
}

// ─── Notifications ─────────────────────────────────────────────────────────

export type NotificationType =
  | 'order'
  | 'inventory'
  | 'customer'
  | 'review'
  | 'system';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  link?: string;
  createdAt: string;
}

// ─── API Responses ─────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
  success: boolean;
}

export interface FilterParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  [key: string]: string | number | boolean | undefined;
}

// ─── Coupon ────────────────────────────────────────────────────────────────
export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  min_order_amount?: number;
  max_discount_amount?: number;
  start_date?: string;
  end_date?: string;
  usage_limit?: number;
  usage_count: number;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
