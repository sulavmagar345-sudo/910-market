import { create } from 'zustand';
import type { Product, FilterParams, ProductImage } from '../types';
import { supabase } from '../../lib/supabase';

interface ProductsStore {
  products: Product[];
  total: number;
  isLoading: boolean;
  error: string | null;
  fetchProducts: (params?: FilterParams) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProductStatus: (id: string, status: Product['status']) => Promise<void>;
}

export const useProductsStore = create<ProductsStore>((set, get) => ({
  products: [],
  total: 0,
  isLoading: false,
  error: null,

  fetchProducts: async (params) => {
    set({ isLoading: true, error: null });
    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          categories ( name ),
          brands ( name ),
          product_images ( id, url, alt_text, is_primary )
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      if (params?.search) {
        query = query.or(`name.ilike.%${params.search}%,sku.ilike.%${params.search}%`);
      }
      
      const { data, error, count } = await query;
      
      if (error) throw error;
      
      // Map to frontend Product type
      const mappedProducts: Product[] = (data || []).map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        shortDescription: p.short_description || '',
        sku: p.sku,
        barcode: p.barcode,
        price: Number(p.price),
        comparePrice: p.compare_at_price ? Number(p.compare_at_price) : undefined,
        categoryId: p.category_id,
        categoryName: p.categories?.name || 'Uncategorized',
        brandId: p.brand_id,
        brandName: p.brands?.name || 'No Brand',
        images: (p.product_images || []).map((img: any) => ({
          id: img.id,
          url: img.url,
          alt: img.alt_text || '',
          isPrimary: img.is_primary
        })),
        status: p.status as any,
        isFeatured: p.is_featured,
        taxRate: 0, // Mocked or calculated
        stock: 0, // Should be joined from inventory table in a real complex setup
        lowStockThreshold: 5,
        volume: '',
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }));

      set({
        products: mappedProducts,
        total: count || 0,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Error fetching products:', error);
      set({ error: error.message || 'Failed to load products', isLoading: false });
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      
      set((state) => ({
        products: state.products.filter(p => p.id !== id),
        total: state.total - 1,
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Error deleting product:', error);
      set({ error: error.message || 'Failed to delete product', isLoading: false });
    }
  },

  updateProductStatus: async (id, status) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('products')
        .update({ status })
        .eq('id', id);
        
      if (error) throw error;
      
      set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, status } : p),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Error updating status:', error);
      set({ error: error.message || 'Failed to update status', isLoading: false });
    }
  }
}));
