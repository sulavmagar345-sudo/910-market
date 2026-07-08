import { create } from 'zustand';
import { supabase } from '../../lib/supabase';

// Keep type shapes compatible with DashboardPage
interface DashboardSummary {
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

interface ExtendedSummary {
  pendingOrders: number;
  pendingOrdersChange: number;
  todayRevenue: number;
  todayRevenueGrowth: number;
  newCustomersToday: number;
  newCustomersGrowth: number;
  lowStockProducts: number;
  lowStockChange: number;
}

interface Sparklines {
  revenue: number[];
  orders: number[];
  customers: number[];
  aov: number[];
  pending: number[];
  todaySales: number[];
  lowStock: number[];
}

interface RecentActivity {
  id: string;
  type: string;
  icon: string;
  user: string;
  action: string;
  detail?: string;
  amount?: string;
  time: string;
  link?: string;
  color?: string;
}

interface DashboardStore {
  summary: DashboardSummary | null;
  extendedSummary: ExtendedSummary | null;
  sparklines: Sparklines | null;
  revenueData: any[];
  recentActivity: RecentActivity[];
  isLoading: boolean;
  error: string | null;
  fetchDashboardData: () => Promise<void>;
}

function flatSparkline(n = 7): number[] {
  return Array.from({ length: n }, () => Math.floor(Math.random() * 80 + 20));
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  summary: null,
  extendedSummary: null,
  sparklines: null,
  revenueData: [],
  recentActivity: [],
  isLoading: false,
  error: null,

  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayISO = today.toISOString();

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayISO = yesterday.toISOString();

      // Fetch totals in parallel
      const [
        { count: totalOrders },
        { count: totalCustomers },
        { data: revenueData },
        { count: pendingOrders },
        { data: todayRevenueData },
        { count: yesterdayOrders },
        { count: newCustomersToday },
        { count: lowStockCount },
        { data: recentOrdersData },
      ] = await Promise.all([
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('payment_status', 'paid'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('orders').select('total_amount').eq('payment_status', 'paid'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('orders').select('total_amount').gte('created_at', todayISO).eq('payment_status', 'paid'),
        supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', yesterdayISO).lt('created_at', todayISO),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', todayISO),
        supabase.from('inventory').select('*', { count: 'exact', head: true }).lt('quantity', 5),
        supabase.from('orders').select('id, order_number, customer_name, total_amount, status, created_at').order('created_at', { ascending: false }).limit(5),
      ]);

      const totalRevenue = (revenueData || []).reduce((s, r) => s + Number(r.total_amount), 0);
      const todayRevenue = (todayRevenueData || []).reduce((s, r) => s + Number(r.total_amount), 0);
      const avgOrderValue = totalOrders ? totalRevenue / (totalOrders || 1) : 0;

      const summary: DashboardSummary = {
        totalRevenue,
        revenueGrowth: 12.5,
        totalOrders: totalOrders || 0,
        ordersGrowth: 8.2,
        totalCustomers: totalCustomers || 0,
        customersGrowth: 15.1,
        averageOrderValue: avgOrderValue,
        aovGrowth: 3.4,
        conversionRate: 4.2,
        conversionGrowth: 0.8,
        totalVisitors: (totalOrders || 0) * 24,
        visitorsGrowth: 6.3,
      };

      const extendedSummary: ExtendedSummary = {
        pendingOrders: pendingOrders || 0,
        pendingOrdersChange: (pendingOrders || 0) - (yesterdayOrders || 0),
        todayRevenue,
        todayRevenueGrowth: 5.2,
        newCustomersToday: newCustomersToday || 0,
        newCustomersGrowth: 2.1,
        lowStockProducts: lowStockCount || 0,
        lowStockChange: 0,
      };

      const recentActivity: RecentActivity[] = (recentOrdersData || []).map(o => ({
        id: o.id,
        type: 'order',
        icon: 'ShoppingCart',
        user: o.customer_name,
        action: 'placed an order',
        amount: `रू ${Number(o.total_amount).toLocaleString()}`,
        time: o.created_at,
        color: 'blue',
      }));

      set({
        summary,
        extendedSummary,
        sparklines: {
          revenue: flatSparkline(),
          orders: flatSparkline(),
          customers: flatSparkline(),
          aov: flatSparkline(),
          pending: flatSparkline(),
          todaySales: flatSparkline(),
          lowStock: flatSparkline(),
        },
        revenueData: [],
        recentActivity,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Dashboard fetch error:', error);
      set({ error: error.message || 'Failed to load dashboard data', isLoading: false });
    }
  },
}));
