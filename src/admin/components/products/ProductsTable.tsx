import type { Product, ProductStatus } from '../../types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/Table';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { MoreHorizontal, Edit, Trash2, Copy, PackageX, EyeOff, CheckCircle2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '../ui/DropdownMenu';
import { formatCurrency } from '../../utils/format';
import { Link } from 'react-router-dom';
import { cn } from '@admin/utils/cn';

interface ProductsTableProps {
  products: Product[];
  isLoading: boolean;
  onDelete: (id: string) => void;
  onUpdateStatus?: (id: string, status: ProductStatus) => void;
}

export function ProductsTable({ products, isLoading, onDelete, onUpdateStatus }: ProductsTableProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-admin-deep-forest border-t-transparent mb-4" />
        <p>Loading catalog...</p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-500">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 mb-4">
          <PackageX className="h-8 w-8 text-slate-400" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 mb-1">No products found</h3>
        <p className="text-sm max-w-sm text-center">Get started by creating a new product or adjusting your search filters.</p>
        <Link to="/admin/products/new" className="mt-6">
          <Button>Add Your First Product</Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200">Published</Badge>;
      case 'draft':
        return <Badge className="bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200">Draft</Badge>;
      case 'archived':
        return <Badge className="bg-slate-100 text-slate-600 hover:bg-slate-200 border-slate-200">Archived</Badge>;
    }
  };

  return (
    <Table>
      <TableHeader className="bg-white">
        <TableRow className="border-b border-slate-200 hover:bg-transparent">
          <TableHead className="w-[48px] py-3"></TableHead>
          <TableHead className="font-semibold text-slate-700">Product</TableHead>
          <TableHead className="font-semibold text-slate-700">Category</TableHead>
          <TableHead className="font-semibold text-slate-700">Status</TableHead>
          <TableHead className="font-semibold text-slate-700">Inventory</TableHead>
          <TableHead className="font-semibold text-slate-700">Price</TableHead>
          <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {products.map((product) => (
          <TableRow key={product.id} className="group hover:bg-slate-50/50 transition-colors">
            <TableCell className="py-3">
              <div className="h-10 w-10 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm flex items-center justify-center">
                {product.images?.[0] ? (
                  <img src={product.images[0].url} alt={product.name} className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                ) : (
                  <PackageX className="h-4 w-4 text-slate-300" />
                )}
              </div>
            </TableCell>
            <TableCell className="py-3">
              <div className="flex flex-col">
                <span className="font-semibold text-slate-900 group-hover:text-admin-deep-forest transition-colors">{product.name}</span>
                <span className="text-xs text-slate-500 mt-0.5 font-mono">{product.sku}</span>
              </div>
            </TableCell>
            <TableCell className="py-3 text-sm text-slate-600">
              {product.categoryName}
            </TableCell>
            <TableCell className="py-3">
              {getStatusBadge(product.status)}
            </TableCell>
            <TableCell className="py-3">
              <div className="flex flex-col items-start gap-1">
                <span className={cn(
                  "text-sm font-medium",
                  product.stock === 0 ? "text-red-600" :
                  product.stock <= product.lowStockThreshold ? "text-amber-600" :
                  "text-slate-700"
                )}>
                  {product.stock} in stock
                </span>
                {product.stock <= product.lowStockThreshold && (
                  <span className={cn(
                    "inline-flex items-center rounded-sm px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                    product.stock === 0 ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  )}>
                    {product.stock === 0 ? 'Out of stock' : 'Low stock'}
                  </span>
                )}
              </div>
            </TableCell>
            <TableCell className="py-3 font-medium text-slate-900">
              {formatCurrency(product.price)}
            </TableCell>
            <TableCell className="py-3 text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4 text-slate-500" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</DropdownMenuLabel>
                  <Link to={`/admin/products/${product.id}/edit`}>
                    <DropdownMenuItem className="cursor-pointer">
                      <Edit className="mr-2 h-4 w-4 text-slate-400" /> Edit Product
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem className="cursor-pointer">
                    <Copy className="mr-2 h-4 w-4 text-slate-400" /> Duplicate
                  </DropdownMenuItem>
                  
                  {onUpdateStatus && (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="cursor-pointer">
                        <CheckCircle2 className="mr-2 h-4 w-4 text-slate-400" />
                        <span>Update Status</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        <DropdownMenuItem onClick={() => onUpdateStatus(product.id, 'published')} className="cursor-pointer">
                          <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" /> Published
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateStatus(product.id, 'draft')} className="cursor-pointer">
                          <EyeOff className="mr-2 h-4 w-4 text-amber-500" /> Draft
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onUpdateStatus(product.id, 'archived')} className="cursor-pointer">
                          <PackageX className="mr-2 h-4 w-4 text-slate-400" /> Archived
                        </DropdownMenuItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  )}

                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer" onClick={() => onDelete(product.id)}>
                    <Trash2 className="mr-2 h-4 w-4" /> Delete Product
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
