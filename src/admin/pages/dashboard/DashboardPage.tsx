import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useDashboardStore } from '../../stores/dashboard.store';
import { StatCard } from '../../components/dashboard/StatCard';
import { RevenueChart } from '../../components/dashboard/RevenueChart';
import { ActivityFeed } from '../../components/dashboard/ActivityFeed';
import { QuickActions } from '../../components/dashboard/QuickActions';
import { CategoryChart } from '../../components/dashboard/CategoryChart';
import { formatCurrency, formatNumber } from '../../utils/format';
import { DollarSign, CreditCard, Users, Target, Clock, AlertTriangle, TrendingUp, UserPlus, FileBarChart } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { pageVariants, staggerContainer } from '../../animations/variants';
import { generateDashboardReport } from '../../utils/pdfGenerator';

export default function DashboardPage() {
  const { summary, extendedSummary, sparklines, recentActivity, isLoading, fetchDashboardData } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDownloadReport = () => {
    if (summary && extendedSummary && recentActivity) {
      generateDashboardReport(summary, extendedSummary, recentActivity);
    }
  };

  if (isLoading || !summary || !extendedSummary || !sparklines) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-admin-deep-forest border-t-transparent" />
      </div>
    );
  }

  const today = format(new Date(), 'EEEE, MMMM do, yyyy');

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="space-y-6 pb-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">
            {today}
          </p>
        </div>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            className="h-9 gap-2 shadow-sm bg-white"
            onClick={handleDownloadReport}
          >
            <FileBarChart className="h-4 w-4 text-slate-500" />
            Download Report
          </Button>
        </div>
      </div>

      {/* Primary KPIs */}
      <motion.div variants={staggerContainer} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          rawValue={summary.totalRevenue}
          trend={summary.revenueGrowth}
          icon={<DollarSign />}
          iconBg="bg-emerald-50"
          sparkline={sparklines.revenue}
          sparklineColor="#10B981"
        />
        <StatCard
          title="Total Orders"
          value={formatNumber(summary.totalOrders)}
          rawValue={summary.totalOrders}
          trend={summary.ordersGrowth}
          icon={<CreditCard />}
          iconBg="bg-blue-50"
          sparkline={sparklines.orders}
          sparklineColor="#3B82F6"
        />
        <StatCard
          title="Active Customers"
          value={formatNumber(summary.totalCustomers)}
          rawValue={summary.totalCustomers}
          trend={summary.customersGrowth}
          icon={<Users />}
          iconBg="bg-indigo-50"
          sparkline={sparklines.customers}
          sparklineColor="#6366F1"
        />
        <StatCard
          title="Conversion Rate"
          value={`${summary.conversionRate}%`}
          rawValue={summary.conversionRate}
          trend={summary.conversionGrowth}
          icon={<Target />}
          iconBg="bg-purple-50"
          sparkline={sparklines.revenue} // using revenue as proxy for visual
          sparklineColor="#8B5CF6"
        />
      </motion.div>

      {/* Secondary KPIs */}
      <motion.div variants={staggerContainer} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          title="Average Order Value"
          value={formatCurrency(summary.averageOrderValue)}
          rawValue={summary.averageOrderValue}
          trend={summary.aovGrowth}
          icon={<TrendingUp />}
          sparkline={sparklines.aov}
          sparklineColor="#1F4D3A"
        />
        <StatCard
          title="Pending Orders"
          value={extendedSummary.pendingOrders}
          rawValue={extendedSummary.pendingOrders}
          trend={extendedSummary.pendingOrdersChange}
          trendLabel="vs yesterday"
          icon={<Clock />}
          iconBg="bg-amber-50"
          sparkline={sparklines.pending}
          sparklineColor="#F59E0B"
        />
        <StatCard
          title="Today's Sales"
          value={formatCurrency(extendedSummary.todayRevenue)}
          rawValue={extendedSummary.todayRevenue}
          trend={extendedSummary.todayRevenueGrowth}
          trendLabel="vs yesterday"
          icon={<DollarSign />}
          iconBg="bg-emerald-50"
          sparkline={sparklines.todaySales}
          sparklineColor="#10B981"
        />
        <StatCard
          title="New Customers"
          value={extendedSummary.newCustomersToday}
          rawValue={extendedSummary.newCustomersToday}
          trend={extendedSummary.newCustomersGrowth}
          trendLabel="vs yesterday"
          icon={<UserPlus />}
          iconBg="bg-blue-50"
          sparkline={sparklines.customers}
          sparklineColor="#3B82F6"
        />
        <StatCard
          title="Low Stock Items"
          value={extendedSummary.lowStockProducts}
          rawValue={extendedSummary.lowStockProducts}
          trend={extendedSummary.lowStockChange}
          trendLabel="vs last week"
          icon={<AlertTriangle />}
          iconBg="bg-red-50"
          sparkline={sparklines.lowStock}
          sparklineColor="#EF4444"
        />
      </motion.div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="lg:col-span-1 space-y-6">
          <CategoryChart />
          <QuickActions />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        <ActivityFeed activities={recentActivity} />
        {/* Placeholder for top products or other widget */}
        <div className="lg:col-span-1 rounded-xl border border-slate-200 bg-white p-6">
          <h3 className="text-base font-semibold text-slate-900 mb-4">Top Selling Brands</h3>
          <div className="space-y-4">
             {/* Mock top brands inline for now to save a component */}
             {[
               { name: 'Old Durbar', revenue: 1240000, units: 380, growth: 18.2 },
               { name: '8848 Vodka', revenue: 980000, units: 445, growth: 12.4 },
               { name: 'Khukuri Rum', revenue: 820000, units: 390, growth: 8.6 },
               { name: 'Tuborg Beer', revenue: 640000, units: 820, growth: 22.1 },
             ].map((brand, i) => (
               <div key={i} className="flex items-center justify-between">
                 <div>
                   <p className="text-sm font-semibold text-slate-800">{brand.name}</p>
                   <p className="text-xs text-slate-500">{brand.units} units</p>
                 </div>
                 <div className="text-right">
                   <p className="text-sm font-semibold text-slate-900">रू {(brand.revenue / 1000).toFixed(0)}k</p>
                   <p className="text-xs text-emerald-600">+{brand.growth}%</p>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
