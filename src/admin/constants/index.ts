import type {  AdminRole, OrderStatus, PaymentStatus, ProductStatus  } from '../types';

export const ADMIN_ROLES: Record<AdminRole, string> = {
  super_admin: 'Super Admin',
  manager: 'Manager',
  inventory_manager: 'Inventory Manager',
  order_manager: 'Order Manager',
  customer_support: 'Customer Support',
  delivery_manager: 'Delivery Manager',
};

export const ORDER_STATUSES: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  packed: 'Packed',
  out_for_delivery: 'Out For Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const PAYMENT_STATUSES: Record<PaymentStatus, string> = {
  pending: 'Pending',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
};

export const PRODUCT_STATUSES: Record<ProductStatus, string> = {
  published: 'Published',
  draft: 'Draft',
  archived: 'Archived',
};
