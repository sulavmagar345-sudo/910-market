import React, { useEffect, useState } from 'react';
import { useOrdersStore } from '../../stores/orders.store';
import { OrdersTable } from '../../components/orders/OrdersTable';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Search, Filter, Download, Calendar } from 'lucide-react';

const tabs = ['All Orders', 'Pending', 'Confirmed', 'Delivered', 'Cancelled'];

export default function OrdersListPage() {
  const { orders, isLoading, fetchOrders, updateOrderStatus } = useOrdersStore();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('All Orders');

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    fetchOrders({ search: e.target.value });
  };

  const filteredOrders = activeTab === 'All Orders' 
    ? orders 
    : orders.filter(o => o.status.toLowerCase() === activeTab.toLowerCase());

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Orders</h1>
          <p className="text-sm text-slate-500 mt-1">Manage, track, and fulfill customer orders.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="h-9 gap-2 bg-white">
            <Download className="h-4 w-4 text-slate-500" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200 px-4 pt-4 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                activeTab === tab
                  ? 'border-admin-deep-forest text-admin-deep-forest'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 bg-slate-50/50 border-b border-slate-200">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search by order ID, customer, or phone..." 
              value={search}
              onChange={handleSearch}
              className="pl-9 bg-white"
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button variant="outline" className="h-9 gap-2 bg-white flex-1 sm:flex-none text-slate-600">
              <Calendar className="h-4 w-4" />
              Date Range
            </Button>
            <Button variant="outline" className="h-9 gap-2 bg-white flex-1 sm:flex-none text-slate-600">
              <Filter className="h-4 w-4" />
              Filters
            </Button>
          </div>
        </div>

        <OrdersTable 
          orders={filteredOrders} 
          isLoading={isLoading} 
          onUpdateStatus={updateOrderStatus}
        />
        
        {/* Pagination Footer */}
        {!isLoading && filteredOrders.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-900">{filteredOrders.length}</span> orders
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled className="bg-white">Previous</Button>
              <Button variant="outline" size="sm" disabled className="bg-white">Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
