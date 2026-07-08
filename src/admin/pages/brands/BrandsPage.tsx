import { useEffect, useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Search, Plus, Pencil, Trash2, Award, Check, X, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

interface Brand {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  website: string | null;
  is_active: boolean;
  logo_url: string | null;
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Brand | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', website: '', is_active: true });
  const [saving, setSaving] = useState(false);

  const fetchBrands = async () => {
    setIsLoading(true);
    const { data, error } = await supabase.from('brands').select('*').order('name');
    if (!error && data) setBrands(data);
    setIsLoading(false);
  };

  useEffect(() => { fetchBrands(); }, []);

  const openAdd = () => {
    setEditItem(null);
    setForm({ name: '', slug: '', description: '', website: '', is_active: true });
    setShowForm(true);
  };

  const openEdit = (b: Brand) => {
    setEditItem(b);
    setForm({ name: b.name, slug: b.slug, description: b.description || '', website: b.website || '', is_active: b.is_active });
    setShowForm(true);
  };

  const handleNameChange = (name: string) => {
    setForm(f => ({ ...f, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      website: form.website || null,
      is_active: form.is_active,
    };
    if (editItem) {
      await supabase.from('brands').update(payload).eq('id', editItem.id);
    } else {
      await supabase.from('brands').insert([payload]);
    }
    setSaving(false);
    setShowForm(false);
    fetchBrands();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this brand? Products linked to it will have no brand.')) return;
    await supabase.from('brands').delete().eq('id', id);
    fetchBrands();
  };

  const filtered = brands.filter(b => b.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Brands</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your product brands and distilleries.</p>
        </div>
        <Button onClick={openAdd} className="gap-2 h-9">
          <Plus className="h-4 w-4" /> Add Brand
        </Button>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4"
          >
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold text-slate-900">{editItem ? 'Edit Brand' : 'New Brand'}</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-slate-700"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name *</label>
                <Input value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="e.g. Old Durbar" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
                <Input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Short description" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
                <Input value={form.website} onChange={e => setForm(f => ({ ...f, website: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="flex items-center gap-3">
                <input type="checkbox" id="brand_active" checked={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} className="rounded border-slate-300 text-admin-deep-forest" />
                <label htmlFor="brand_active" className="text-sm font-medium text-slate-700">Active</label>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button className="flex-1 gap-2" onClick={handleSave} disabled={saving}>
                <Check className="h-4 w-4" />{saving ? 'Saving...' : 'Save Brand'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-4 bg-slate-50/50 border-b border-slate-200">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input placeholder="Search brands..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9 bg-white" />
          </div>
          <p className="text-sm text-slate-500 ml-4 whitespace-nowrap">{filtered.length} brands</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-admin-deep-forest border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Award className="h-12 w-12 mb-4 opacity-30" />
            <p className="font-medium text-slate-600">No brands yet</p>
            <p className="text-sm mt-1">Click "Add Brand" to get started.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-white">
                <th className="text-left font-semibold text-slate-700 px-4 py-3">Brand</th>
                <th className="text-left font-semibold text-slate-700 px-4 py-3 hidden md:table-cell">Description</th>
                <th className="text-left font-semibold text-slate-700 px-4 py-3 hidden sm:table-cell">Website</th>
                <th className="text-left font-semibold text-slate-700 px-4 py-3">Status</th>
                <th className="text-right font-semibold text-slate-700 px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(brand => (
                <tr key={brand.id} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors group">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900">{brand.name}</p>
                    <p className="text-xs text-slate-400 font-mono">{brand.slug}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-400 hidden md:table-cell truncate max-w-[200px]">{brand.description || '—'}</td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {brand.website ? (
                      <a href={brand.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline text-xs">
                        <Globe className="h-3 w-3" /> Website
                      </a>
                    ) : <span className="text-slate-300">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={brand.is_active ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-100 text-slate-500 border-slate-200'}>
                      {brand.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(brand)}>
                        <Pencil className="h-3.5 w-3.5 text-slate-500" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(brand.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-red-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
