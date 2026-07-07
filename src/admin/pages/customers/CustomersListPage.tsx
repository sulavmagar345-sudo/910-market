import React, { useEffect, useState } from 'react';
import { useCustomersStore } from '../../stores/customers.store';
import { Input } from '../../components/ui/Input';
import { Search, MoreHorizontal, User, Filter, Download } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/Table';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { formatCurrency, formatDate } from '../../utils/format';

export default function CustomersListPage() {
  const { customers, isLoading, fetchCustomers } = useCustomersStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    fetchCustomers({ search: e.target.value });
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500 mt-1">View and manage customer profiles and purchase history.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="h-9 gap-2 bg-white w-full sm:w-auto">
            <Download className="h-4 w-4 text-slate-500" />
            Export Customers
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-3 bg-slate-50/50 border-b border-slate-200">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search customers by name, phone or email..." 
              value={search}
              onChange={handleSearch}
              className="pl-9 bg-white"
            />
          </div>
          <Button variant="outline" className="h-9 gap-2 bg-white text-slate-600 w-full sm:w-auto">
            <Filter className="h-4 w-4" />
            Filter Segments
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-admin-deep-forest border-t-transparent mb-4" />
            <p>Loading customers...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
              <User className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">No customers found</h3>
            <p className="text-sm max-w-sm text-center">No customer records matching search parameters.</p>
          </div>
        ) : (
          <Table className="min-w-[650px]">
            <TableHeader className="bg-white">
              <TableRow className="border-b border-slate-200 hover:bg-transparent">
                <TableHead className="font-semibold text-slate-700">Customer</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Orders</TableHead>
                <TableHead className="font-semibold text-slate-700">Total Spent</TableHead>
                <TableHead className="font-semibold text-slate-700">Last Order</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {customers.map((customer) => (
                <TableRow key={customer.id} className="group hover:bg-slate-50/50 transition-colors animate-fade-in">
                  <TableCell className="py-3.5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 group-hover:text-admin-deep-forest transition-colors">{customer.name}</span>
                      <span className="text-xs text-slate-500 mt-0.5 font-mono">{customer.phone}</span>
                      {customer.email && <span className="text-xs text-slate-400 mt-0.5">{customer.email}</span>}
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <Badge className={customer.status === 'active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-600 border-slate-200'}>
                      {customer.status.charAt(0).toUpperCase() + customer.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3.5 text-sm font-semibold text-slate-700">{customer.totalOrders}</TableCell>
                  <TableCell className="py-3.5 text-sm font-semibold text-slate-900">{formatCurrency(customer.totalSpent)}</TableCell>
                  <TableCell className="py-3.5 text-sm text-slate-500">{customer.lastOrderAt ? formatDate(customer.lastOrderAt) : '-'}</TableCell>
                  <TableCell className="py-3.5 text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4 text-slate-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
