import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Label } from '../ui/Label';
import { Switch } from '../ui/Switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';

// Categories that use ML/L units and have alcohol percentage
const ALCOHOL_CATEGORY_SLUGS = ['whisky', 'vodka', 'beer', 'wine', 'rum', 'brandy-cognac', 'gin', 'tequila', 'liqueurs', 'sake-asian', 'cider-rtd'];

const VOLUME_UNITS = [
  { value: 'ML', label: 'ML (millilitre)' },
  { value: 'L', label: 'L (litre)' },
  { value: 'g', label: 'g (gram)' },
  { value: 'kg', label: 'kg (kilogram)' },
  { value: 'Pcs', label: 'Pcs (pieces)' },
  { value: 'Pack', label: 'Pack' },
  { value: 'Bottle', label: 'Bottle' },
  { value: 'Can', label: 'Can' },
  { value: 'Sachet', label: 'Sachet' },
  { value: 'Pair', label: 'Pair' },
];

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  price: z.coerce.number().min(0, 'Price must be positive'),
  comparePrice: z.coerce.number().optional(),
  stock: z.coerce.number().min(0, 'Stock cannot be negative'),
  lowStockThreshold: z.coerce.number().min(0),
  volumeQty: z.coerce.number().min(0, 'Quantity required'),
  volumeUnit: z.string().min(1, 'Unit is required'),
  alcoholPercent: z.coerce.number().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  brandId: z.string().min(1, 'Brand is required'),
  status: z.enum(['active', 'draft', 'archived']),
  isFeatured: z.boolean().default(false),
  shortDescription: z.string().min(1, 'Short description is required'),
  description: z.string().min(1, 'Full description is required'),
});

export type ProductFormValues = z.infer<typeof productSchema>;

export interface ProductFormProps {
  initialData?: any;
  categories?: any[];
  brands?: any[];
  onSubmit: (data: ProductFormValues, imageFile: File | null) => void;
  isLoading?: boolean;
}

export function ProductForm({ initialData, categories, brands, onSubmit, isLoading }: ProductFormProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAlcohol, setIsAlcohol] = useState(true);

  useEffect(() => {
    try {
      if (initialData && initialData.images && initialData.images.length > 0 && initialData.images[0].url) {
        setImagePreview(initialData.images[0].url);
      }
    } catch (err) {
      console.error(err);
    }
  }, [initialData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setImagePreview(url);
      } else if (initialData && initialData.images && initialData.images.length > 0) {
        setImagePreview(initialData.images[0].url);
      } else {
        setImagePreview(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as any,
    defaultValues: initialData ? {
      ...initialData,
      volumeQty: parseFloat(initialData.volume?.split(' ')?.[0] || '750') || 750,
      volumeUnit: initialData.volume?.split(' ')?.[1] || 'ML',
    } : {
      name: '',
      sku: '',
      barcode: '',
      price: 0,
      stock: 0,
      lowStockThreshold: 10,
      volumeQty: 750,
      volumeUnit: 'ML',
      status: 'draft',
      isFeatured: false,
      shortDescription: '',
      description: '',
    },
  });

  // Watch categoryId to toggle alcohol fields
  const watchedCategoryId = form.watch('categoryId');
  useEffect(() => {
    if (watchedCategoryId && categories) {
      const cat = categories.find(c => c.id === watchedCategoryId);
      const slug = cat?.slug || '';
      setIsAlcohol(ALCOHOL_CATEGORY_SLUGS.includes(slug));
    }
  }, [watchedCategoryId, categories]);

  return (
    <form
      onSubmit={form.handleSubmit((d) => {
        const fileInput = document.getElementById('image') as HTMLInputElement;
        onSubmit(d, fileInput?.files?.[0] || null);
      })}
      className="space-y-8"
    >
      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="image">Product Image</Label>
                <div className="flex items-start gap-4">
                  {imagePreview && (
                    <div className="relative h-24 w-24 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 flex-shrink-0">
                      <img src={imagePreview} alt="Preview" className="h-full w-full object-contain" />
                    </div>
                  )}
                  <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="flex-1" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Product Name</Label>
                <Input id="name" {...form.register('name')} />
                {form.formState.errors.name && (
                  <p className="text-sm text-admin-danger">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="shortDescription">Short Description</Label>
                <Input id="shortDescription" {...form.register('shortDescription')} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Full Description</Label>
                <Textarea id="description" rows={5} {...form.register('description')} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (रू)</Label>
                  <Input id="price" type="number" step="0.01" {...form.register('price')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comparePrice">Compare at Price (Optional)</Label>
                  <Input id="comparePrice" type="number" step="0.01" {...form.register('comparePrice')} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" {...form.register('sku')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="barcode">Barcode (Optional)</Label>
                  <Input id="barcode" {...form.register('barcode')} />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Quantity</Label>
                  <Input id="stock" type="number" {...form.register('stock')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lowStockThreshold">Low Stock Threshold</Label>
                  <Input id="lowStockThreshold" type="number" {...form.register('lowStockThreshold')} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organization</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Controller
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="archived">Archived</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-2">
                <Label>Category</Label>
                <Controller
                  control={form.control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories && categories.length > 0 ? (
                          categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value="_none" disabled>No categories — add them first</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.categoryId && (
                  <p className="text-sm text-admin-danger">{form.formState.errors.categoryId.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Brand</Label>
                <Controller
                  control={form.control}
                  name="brandId"
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands && brands.length > 0 ? (
                          brands.map((b) => (
                            <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                          ))
                        ) : (
                          <SelectItem value="_none" disabled>No brands — add them first</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {form.formState.errors.brandId && (
                  <p className="text-sm text-admin-danger">{form.formState.errors.brandId.message}</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Properties</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Size / Quantity</Label>
                <div className="flex gap-2">
                  <Input
                    id="volumeQty"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 750"
                    className="w-24 flex-shrink-0"
                    {...form.register('volumeQty')}
                  />
                  <Controller
                    control={form.control}
                    name="volumeUnit"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Unit" />
                        </SelectTrigger>
                        <SelectContent>
                          {VOLUME_UNITS.map(u => (
                            <SelectItem key={u.value} value={u.value}>{u.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                {form.formState.errors.volumeQty && (
                  <p className="text-sm text-admin-danger">{form.formState.errors.volumeQty.message}</p>
                )}
              </div>
              {isAlcohol && (
                <div className="space-y-2">
                  <Label htmlFor="alcoholPercent">Alcohol % (Optional)</Label>
                  <Input id="alcoholPercent" type="number" step="0.1" {...form.register('alcoholPercent')} />
                </div>
              )}

              <div className="flex items-center justify-between pt-4">
                <div className="space-y-0.5">
                  <Label>Featured Product</Label>
                  <p className="text-xs text-admin-text-muted">Show on homepage</p>
                </div>
                <Controller
                  control={form.control}
                  name="isFeatured"
                  render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="outline" type="button" onClick={() => window.history.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : 'Save Product'}
        </Button>
      </div>
    </form>
  );
}
