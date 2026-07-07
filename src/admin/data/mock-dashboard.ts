import type { AnalyticsSummary, RevenueDataPoint } from '../types';

export const mockAnalyticsSummary: AnalyticsSummary = {
  totalRevenue: 4582000,
  revenueGrowth: 12.5,
  totalOrders: 1432,
  ordersGrowth: 8.2,
  totalCustomers: 890,
  customersGrowth: 15.3,
  averageOrderValue: 3200,
  aovGrowth: 4.1,
  conversionRate: 3.2,
  conversionGrowth: -1.2,
  totalVisitors: 45000,
  visitorsGrowth: 22.4,
};

export const mockExtendedSummary = {
  todayRevenue: 142500,
  todayRevenueGrowth: 7.3,
  pendingOrders: 24,
  pendingOrdersChange: 3,
  lowStockProducts: 6,
  lowStockChange: -2,
  todayRefunds: 12000,
  todayRefundsGrowth: -15.4,
  newCustomersToday: 12,
  newCustomersGrowth: 20.0,
};

// Sparkline data (last 7 days)
export const mockSparklines = {
  revenue:    [320000, 290000, 410000, 380000, 450000, 420000, 490000],
  orders:     [95, 80, 120, 110, 130, 118, 142],
  customers:  [12, 8, 18, 15, 22, 19, 25],
  aov:        [2800, 3100, 2900, 3300, 3100, 3400, 3200],
  pending:    [20, 28, 18, 32, 26, 22, 24],
  lowStock:   [4, 5, 7, 6, 8, 7, 6],
  todaySales: [90000, 110000, 85000, 130000, 125000, 138000, 142500],
  refunds:    [18000, 9000, 22000, 14000, 8000, 15000, 12000],
};

export const mockRevenueDataWeekly: RevenueDataPoint[] = [
  { date: 'Mon', revenue: 320000, orders: 95 },
  { date: 'Tue', revenue: 290000, orders: 80 },
  { date: 'Wed', revenue: 410000, orders: 120 },
  { date: 'Thu', revenue: 380000, orders: 110 },
  { date: 'Fri', revenue: 450000, orders: 130 },
  { date: 'Sat', revenue: 520000, orders: 155 },
  { date: 'Sun', revenue: 310000, orders: 88 },
];

export const mockRevenueDataMonthly: RevenueDataPoint[] = [
  { date: 'Jan', revenue: 2800000, orders: 820 },
  { date: 'Feb', revenue: 3100000, orders: 910 },
  { date: 'Mar', revenue: 2650000, orders: 780 },
  { date: 'Apr', revenue: 3400000, orders: 1020 },
  { date: 'May', revenue: 3800000, orders: 1140 },
  { date: 'Jun', revenue: 4100000, orders: 1230 },
  { date: 'Jul', revenue: 4582000, orders: 1432 },
];

export const mockRevenueDataYearly: RevenueDataPoint[] = [
  { date: '2020', revenue: 12000000, orders: 3600 },
  { date: '2021', revenue: 18500000, orders: 5500 },
  { date: '2022', revenue: 25000000, orders: 7400 },
  { date: '2023', revenue: 34000000, orders: 10200 },
  { date: '2024', revenue: 42000000, orders: 12600 },
  { date: '2025', revenue: 51000000, orders: 15400 },
  { date: '2026', revenue: 32074000, orders: 9624 },
];

// Alias for default (monthly)
export const mockRevenueData: RevenueDataPoint[] = mockRevenueDataMonthly;

export const mockCategoryData = [
  { name: 'Whisky', value: 38, revenue: 1741160, color: '#1F4D3A' },
  { name: 'Vodka', value: 24, revenue: 1099680, color: '#B88A2E' },
  { name: 'Rum', value: 18, revenue: 824760, color: '#3B7A5A' },
  { name: 'Beer', value: 12, revenue: 549840, color: '#D4A853' },
  { name: 'Wine', value: 8, revenue: 366560, color: '#6B9E80' },
];

export const mockOrderStatusData = [
  { name: 'Delivered', value: 748, color: '#10B981' },
  { name: 'Pending', value: 312, color: '#F59E0B' },
  { name: 'Confirmed', value: 218, color: '#3B82F6' },
  { name: 'Cancelled', value: 98, color: '#EF4444' },
  { name: 'Refunded', value: 56, color: '#8B5CF6' },
];

export const mockTopBrands = [
  { name: 'Old Durbar', revenue: 1240000, units: 380, growth: 18.2 },
  { name: '8848', revenue: 980000, units: 445, growth: 12.4 },
  { name: 'Khukuri', revenue: 820000, units: 390, growth: 8.6 },
  { name: 'Tuborg', revenue: 640000, units: 820, growth: 22.1 },
  { name: 'Carlsberg', revenue: 520000, units: 640, growth: 5.3 },
];

export const mockRecentActivity = [
  {
    id: '1',
    type: 'order',
    icon: 'ShoppingCart',
    user: 'Sita Sharma',
    action: 'placed a new order',
    detail: 'ORD-910-0124',
    amount: 'रू 4,500',
    time: '2 mins ago',
    link: '/admin/orders',
    color: 'emerald',
  },
  {
    id: '2',
    type: 'customer',
    icon: 'UserPlus',
    user: 'Hari Bahadur',
    action: 'registered as a new customer',
    detail: 'Via mobile app',
    time: '14 mins ago',
    link: '/admin/customers',
    color: 'blue',
  },
  {
    id: '3',
    type: 'inventory',
    icon: 'AlertTriangle',
    user: 'System',
    action: 'Low stock alert',
    detail: '8848 Premium Vodka — 5 units left',
    time: '1 hour ago',
    link: '/admin/inventory',
    color: 'amber',
  },
  {
    id: '4',
    type: 'review',
    icon: 'Star',
    user: 'Ram Krishna',
    action: 'submitted a 5-star review',
    detail: 'Old Durbar Black Chimney',
    time: '2 hours ago',
    link: '/admin/reviews',
    color: 'gold',
  },
  {
    id: '5',
    type: 'order',
    icon: 'CheckCircle',
    user: 'Priya Thapa',
    action: 'order delivered successfully',
    detail: 'ORD-910-0119 — रू 8,200',
    time: '3 hours ago',
    link: '/admin/orders',
    color: 'emerald',
  },
  {
    id: '6',
    type: 'product',
    icon: 'Package',
    user: 'Admin',
    action: 'added a new product',
    detail: 'Carlsberg Special Brew 650ml',
    time: '5 hours ago',
    link: '/admin/products',
    color: 'purple',
  },
  {
    id: '7',
    type: 'coupon',
    icon: 'Ticket',
    user: 'Admin',
    action: 'created discount coupon',
    detail: 'DASHAIN20 — 20% off',
    time: '6 hours ago',
    link: '/admin/coupons',
    color: 'pink',
  },
  {
    id: '8',
    type: 'payment',
    icon: 'CreditCard',
    user: 'Mohan Gurung',
    action: 'payment received via eSewa',
    detail: 'रू 12,600 — ORD-910-0121',
    time: '8 hours ago',
    link: '/admin/orders',
    color: 'emerald',
  },
];
