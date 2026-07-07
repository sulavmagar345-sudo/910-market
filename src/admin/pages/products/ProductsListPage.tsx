import React, { useEffect, useState } from 'react';
import { useProductsStore } from '../../stores/products.store';
import { ProductsTable } from '../../components/products/ProductsTable';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Plus, Search, Filter, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function ProductsListPage() {
  const { products, isLoading, fetchProducts, deleteProduct, updateProductStatus } = useProductsStore();
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    fetchProducts({ search: e.target.value });
  };

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Products</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your catalog, inventory, and pricing.</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline" className="h-9 gap-2 bg-white hidden sm:flex">
            <Download className="h-4 w-4 text-slate-500" />
            Export
          </Button>
          <Link to="/admin/products/new">
            <Button className="w-full sm:w-auto h-9">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center space-x-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input 
                placeholder="Search products by name, SKU or brand..." 
                value={search}
                onChange={handleSearch}
                className="pl-9 bg-white"
              />
            </div>
            <Button variant="outline" className="h-9 gap-2 bg-white text-slate-600 hidden sm:flex">
              <Filter className="h-4 w-4" />
              More Filters
            </Button>
          </div>
        </div>

        <ProductsTable 
          products={products} 
          isLoading={isLoading} 
          onDelete={deleteProduct}
          onUpdateStatus={updateProductStatus}
        />
        
        {/* Pagination Footer */}
        {!isLoading && products.length > 0 && (
          <div className="flex items-center justify-between p-4 border-t border-slate-200 bg-slate-50/50">
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-900">{products.length}</span> products
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
