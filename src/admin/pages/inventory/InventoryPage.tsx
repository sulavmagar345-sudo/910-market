import React, { useEffect, useState } from 'react';
import { useInventoryStore } from '../../stores/inventory.store';
import { Input } from '../../components/ui/Input';
import { Search, PackageCheck, Filter, Download } from 'lucide-react';
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
import { formatDate } from '../../utils/format';

export default function InventoryPage() {
  const { inventory, isLoading, fetchInventory } = useInventoryStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    fetchInventory({ search: e.target.value });
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Inventory</h1>
          <p className="text-sm text-slate-500 mt-1">Monitor stock quantities, thresholds, and replenishment status.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="h-9 gap-2 bg-white w-full sm:w-auto">
            <Download className="h-4 w-4 text-slate-500" />
            Export Inventory
          </Button>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 gap-3 bg-slate-50/50 border-b border-slate-200">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Search by product name or SKU..." 
              value={search}
              onChange={handleSearch}
              className="pl-9 bg-white"
            />
          </div>
          <Button variant="outline" className="h-9 gap-2 bg-white text-slate-600 w-full sm:w-auto">
            <Filter className="h-4 w-4" />
            Status Filter
          </Button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-admin-deep-forest border-t-transparent mb-4" />
            <p>Loading inventory...</p>
          </div>
        ) : inventory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
              <PackageCheck className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">No items found</h3>
            <p className="text-sm max-w-sm text-center">No inventory listings match your current filters.</p>
          </div>
        ) : (
          <Table className="min-w-[650px]">
            <TableHeader className="bg-white">
              <TableRow className="border-b border-slate-200 hover:bg-transparent">
                <TableHead className="font-semibold text-slate-700">Product</TableHead>
                <TableHead className="font-semibold text-slate-700">Category / Brand</TableHead>
                <TableHead className="font-semibold text-slate-700">Stock Level</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventory.map((item) => (
                <TableRow key={item.productId} className="group hover:bg-slate-50/50 transition-colors animate-fade-in">
                  <TableCell className="py-3.5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 group-hover:text-admin-deep-forest transition-colors">{item.productName}</span>
                      <span className="text-xs text-slate-500 mt-0.5 font-mono">{item.sku}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-700">{item.categoryName}</span>
                      <span className="text-xs text-slate-400 mt-0.5">{item.brandName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <div className="flex items-center space-x-2 text-sm">
                      <span className="font-semibold text-slate-900">{item.currentStock}</span>
                      <span className="text-slate-400">/</span>
                      <span className="text-xs text-slate-500 font-medium">{item.lowStockThreshold} threshold</span>
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    <Badge 
                      className={
                        item.status === 'in_stock' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : item.status === 'out_of_stock' 
                            ? 'bg-red-50 text-red-700 border-red-200' 
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                      }
                    >
                      {item.status === 'in_stock' ? 'IN STOCK' : item.status === 'out_of_stock' ? 'OUT OF STOCK' : 'LOW STOCK'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3.5 text-sm text-slate-500">{formatDate(item.lastUpdated)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
