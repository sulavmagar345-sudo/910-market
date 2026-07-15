import { useEffect, useState } from 'react';
import { useCouponsStore } from '../../stores/coupons.store';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '../../components/ui/Dialog';
import { Search, Plus, Trash2, Ticket, Check, X, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

export default function CouponsPage() {
  const { coupons, isLoading, error, fetchCoupons, createCoupon, updateCouponStatus, deleteCoupon } = useCouponsStore();
  
  const [search, setSearch] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [form, setForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    min_order_amount: '',
    max_discount_amount: '',
    usage_limit: '',
    start_date: '',
    end_date: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateCouponStatus(id, !currentStatus);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      try {
        await deleteCoupon(id);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!form.code.trim()) {
      setFormError('Coupon code is required');
      return;
    }
    if (!form.value || Number(form.value) <= 0) {
      setFormError('Discount value must be greater than 0');
      return;
    }

    setSaving(true);
    try {
      await createCoupon({
        code: form.code.toUpperCase().trim(),
        type: form.type,
        value: Number(form.value),
        min_order_amount: form.min_order_amount ? Number(form.min_order_amount) : undefined,
        max_discount_amount: form.max_discount_amount ? Number(form.max_discount_amount) : undefined,
        usage_limit: form.usage_limit ? Number(form.usage_limit) : undefined,
        start_date: form.start_date ? new Date(form.start_date).toISOString() : new Date().toISOString(),
        end_date: form.end_date ? new Date(form.end_date).toISOString() : undefined,
        is_active: true,
      });

      // Reset form & Close
      setForm({
        code: '',
        type: 'percentage',
        value: '',
        min_order_amount: '',
        max_discount_amount: '',
        usage_limit: '',
        start_date: '',
        end_date: '',
      });
      setIsAddOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  const filteredCoupons = coupons.filter(c => 
    c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Discount Coupons</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage promotional discount codes and track their usage.
          </p>
        </div>
        
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-admin-deep-forest hover:bg-admin-deep-forest/90 text-white">
              <Plus className="h-4 w-4" />
              Add Coupon
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create Discount Coupon</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="space-y-4 py-2">
              {formError && (
                <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100">
                  {formError}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="text-xs font-semibold text-slate-700 block mb-1">COUPON CODE</label>
                  <Input 
                    value={form.code} 
                    onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
                    placeholder="e.g. SUMMER20" 
                    className="uppercase"
                    required
                  />
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">DISCOUNT TYPE</label>
                  <select 
                    value={form.type} 
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as any }))}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-admin-deep-forest"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (रू)</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">DISCOUNT VALUE</label>
                  <Input 
                    type="number"
                    value={form.value} 
                    onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                    placeholder="e.g. 10" 
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">MIN ORDER AMOUNT (रू)</label>
                  <Input 
                    type="number"
                    value={form.min_order_amount} 
                    onChange={e => setForm(f => ({ ...f, min_order_amount: e.target.value }))}
                    placeholder="e.g. 1000" 
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">USAGE LIMIT (Total)</label>
                  <Input 
                    type="number"
                    value={form.usage_limit} 
                    onChange={e => setForm(f => ({ ...f, usage_limit: e.target.value }))}
                    placeholder="e.g. 50" 
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">START DATE</label>
                  <Input 
                    type="datetime-local"
                    value={form.start_date} 
                    onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">END DATE</label>
                  <Input 
                    type="datetime-local"
                    value={form.end_date} 
                    onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))}
                  />
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={saving} className="bg-admin-deep-forest hover:bg-admin-deep-forest/90 text-white">
                  {saving ? 'Creating...' : 'Create Coupon'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Main Table Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        {/* Filters bar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search coupon code..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 h-9 bg-white"
            />
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-600 border-b border-red-100 text-sm">
            {error}
          </div>
        )}

        {/* Table content */}
        <div className="overflow-x-auto">
          {isLoading && coupons.length === 0 ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-admin-deep-forest border-t-transparent" />
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <Ticket className="h-10 w-10 mb-2 opacity-30" />
              <p className="text-sm">No coupons found.</p>
            </div>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3.5">Coupon</th>
                  <th className="px-6 py-3.5">Type</th>
                  <th className="px-6 py-3.5">Value</th>
                  <th className="px-6 py-3.5">Min Order</th>
                  <th className="px-6 py-3.5">Usage</th>
                  <th className="px-6 py-3.5">End Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCoupons.map((coupon) => (
                  <motion.tr 
                    key={coupon.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900 flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-admin-deep-forest" />
                      {coupon.code}
                    </td>
                    <td className="px-6 py-4 capitalize text-slate-600">
                      {coupon.type}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {coupon.type === 'percentage' ? `${coupon.value}%` : `रू ${Number(coupon.value).toLocaleString()}`}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {coupon.min_order_amount ? `रू ${Number(coupon.min_order_amount).toLocaleString()}` : '—'}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {coupon.usage_count} / {coupon.usage_limit || '∞'}
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {coupon.end_date ? (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {format(new Date(coupon.end_date), 'yyyy-MM-dd HH:mm')}
                        </span>
                      ) : 'Never Expire'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(coupon.id, coupon.is_active)}
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition-all ${
                          coupon.is_active 
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {coupon.is_active ? (
                          <>
                            <Check className="h-3 w-3" /> Active
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3" /> Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(coupon.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
