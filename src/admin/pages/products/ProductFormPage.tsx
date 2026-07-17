import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductForm } from '../../components/products/ProductForm';
import { useProductsStore } from '../../stores/products.store';
import { useCategoriesStore } from '../../stores/categories.store';
import { useBrandsStore } from '../../stores/brands.store';
import { ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../../lib/supabase';

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;
  const { products, fetchProducts } = useProductsStore();
  const { categories, fetchCategories } = useCategoriesStore();
  const { brands, fetchBrands } = useBrandsStore();
  
  const [product, setProduct] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, [fetchCategories, fetchBrands]);

  useEffect(() => {
    if (isEditing) {
      const found = products.find(p => p.id === id);
      if (found) {
        setProduct({
          ...found,
          categoryId: found.categoryId,
          brandId: found.brandId,
          stock: found.stock || 0,
          lowStockThreshold: found.lowStockThreshold || 10,
          alcoholPercent: found.alcoholPercent || undefined,
        });
      }
    }
  }, [id, isEditing, products]);

  const handleSubmit = async (data: any, imageFile: File | null) => {
    setIsSubmitting(true);
    try {
      let imageUrl = null;
      let imagePath = null;

      // 1. Upload image if provided
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('products')
          .upload(fileName, imageFile);

        if (uploadError) throw new Error(`Image upload failed: ${uploadError.message}`);

        const { data: { publicUrl } } = supabase.storage
          .from('products')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;
        imagePath = fileName;
      }

      // 2. Save Product — make slug unique with timestamp
      const baseSlug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      const uniqueSlug = isEditing ? baseSlug : `${baseSlug}-${Date.now()}`;

      const productData = {
        name: data.name,
        slug: uniqueSlug,
        description: data.description,
        short_description: data.shortDescription,
        sku: data.sku,
        barcode: data.barcode || null,
        price: data.price,
        compare_at_price: data.comparePrice || null,
        category_id: data.categoryId,
        brand_id: data.brandId,
        status: data.status,
        is_featured: data.isFeatured,
        is_active: true,
        // Store volume as the first tag, e.g. ["750 ML"] or ["500 g"]
        tags: [`${data.volumeQty} ${data.volumeUnit}`],
      };

      let productId = id;

      if (isEditing) {
        const { error } = await supabase.from('products').update(productData).eq('id', id);
        if (error) throw new Error(`Product update failed: ${error.message}`);
      } else {
        const { data: newProduct, error } = await supabase
          .from('products')
          .insert([productData])
          .select()
          .single();
        if (error) throw new Error(`Product save failed: ${error.message}`);
        productId = newProduct.id;
      }

      // 3. Create Default Variant & Save Inventory
      if (!isEditing) {
        // Use a unique SKU for the variant to avoid conflicts with product SKU
        const variantSku = `${data.sku}-v${Date.now()}`;

        const { data: defaultVariant, error: variantError } = await supabase
          .from('product_variants')
          .insert([{
            product_id: productId,
            name: 'Default',
            sku: variantSku,
            barcode: null, // don't copy barcode to avoid unique conflict
            price: data.price,
            compare_at_price: data.comparePrice || null,
            is_active: true,
            sort_order: 0
          }])
          .select()
          .single();

        if (variantError) throw new Error(`Variant creation failed: ${variantError.message}`);

        const { error: invError } = await supabase.from('inventory').insert([{
          product_id: productId,
          variant_id: defaultVariant.id,
          quantity: data.stock,
          low_stock_threshold: data.lowStockThreshold
        }]);

        if (invError) throw new Error(`Inventory creation failed: ${invError.message}`);

      } else {
        // Update existing variant
        const { data: existingVariants } = await supabase
          .from('product_variants')
          .select('id')
          .eq('product_id', productId)
          .limit(1);

        if (existingVariants && existingVariants.length > 0) {
          const variantId = existingVariants[0].id;

          await supabase.from('product_variants').update({
            price: data.price,
            compare_at_price: data.comparePrice || null,
          }).eq('id', variantId);

          await supabase.from('inventory').update({
            quantity: data.stock,
            low_stock_threshold: data.lowStockThreshold
          }).eq('variant_id', variantId);
        }
      }

      // 4. Save Image Link
      if (imageUrl && imagePath) {
        const { error: imgError } = await supabase.from('product_images').insert([{
          product_id: productId,
          url: imageUrl,
          storage_path: imagePath,
          is_primary: true
        }]);
        if (imgError) throw new Error(`Image record save failed: ${imgError.message}`);
      }

      await fetchProducts();
      navigate('/admin/products');
    } catch (error: any) {
      console.error('Failed to save product:', error);
      alert(`Failed to save product:\n${error?.message || JSON.stringify(error)}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isEditing && !product) {
    return <div className="p-8 text-center text-admin-text-muted">Loading product details...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/admin/products')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
          <p className="text-sm text-admin-text-muted">
            {isEditing ? `Editing ${product.name}` : 'Create a new product in your catalog'}
          </p>
        </div>
      </div>

      <ProductForm 
        initialData={product} 
        categories={categories}
        brands={brands}
        onSubmit={handleSubmit} 
        isLoading={isSubmitting} 
      />
    </div>
  );
}
