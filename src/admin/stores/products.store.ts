import { create } from 'zustand';
import type {  Product, FilterParams  } from '../types';
import { mockProducts } from '../data/mock-products';

interface ProductsStore {
  products: Product[];
  total: number;
  isLoading: boolean;
  error: string | null;
  fetchProducts: (params?: FilterParams) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProductStatus: (id: string, status: Product['status']) => Promise<void>;
}

export const useProductsStore = create<ProductsStore>((set) => ({
  products: [],
  total: 0,
  isLoading: false,
  error: null,

  fetchProducts: async (params) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      let filtered = [...mockProducts];
      
      if (params?.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(p => p.name.toLowerCase().includes(query) || p.sku.toLowerCase().includes(query));
      }

      set({
        products: filtered,
        total: filtered.length,
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to load products', isLoading: false });
    }
  },

  deleteProduct: async (id) => {
    set({ isLoading: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      set((state) => ({
        products: state.products.filter(p => p.id !== id),
        total: state.total - 1,
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to delete product', isLoading: false });
    }
  },

  updateProductStatus: async (id, status) => {
    set({ isLoading: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, status } : p),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update status', isLoading: false });
    }
  }
}));
