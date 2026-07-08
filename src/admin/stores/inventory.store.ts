import { create } from 'zustand';
import type { InventoryItem, FilterParams } from '../types';
import { supabase } from '../../lib/supabase';

interface InventoryStore {
  inventory: InventoryItem[];
  isLoading: boolean;
  error: string | null;
  fetchInventory: (params?: FilterParams) => Promise<void>;
  updateStock: (productId: string, newStock: number) => Promise<void>;
}

export const useInventoryStore = create<InventoryStore>((set) => ({
  inventory: [],
  isLoading: false,
  error: null,

  fetchInventory: async (params) => {
    set({ isLoading: true, error: null });
    try {
      let query = supabase
        .from('inventory')
        .select(`
          quantity,
          low_stock_threshold,
          updated_at,
          products!inner (
            id,
            name,
            sku,
            categories ( name ),
            brands ( name )
          )
        `);
        
      const { data, error } = await query;
      if (error) throw error;
      
      const mappedInventory: InventoryItem[] = (data || []).map(i => {
        const product = i.products as any;
        const currentStock = i.quantity;
        const lowStockThreshold = i.low_stock_threshold || 5;
        
        let status: 'in_stock' | 'low_stock' | 'out_of_stock' = 'in_stock';
        if (currentStock === 0) status = 'out_of_stock';
        else if (currentStock <= lowStockThreshold) status = 'low_stock';
        
        return {
          productId: product.id,
          productName: product.name,
          sku: product.sku || '',
          categoryName: product.categories?.name || 'Uncategorized',
          brandName: product.brands?.name || 'No Brand',
          currentStock,
          lowStockThreshold,
          status,
          lastUpdated: i.updated_at
        };
      });
      
      let filtered = mappedInventory;
      if (params?.search) {
        const q = params.search.toLowerCase();
        filtered = filtered.filter(i => 
          i.productName.toLowerCase().includes(q) || 
          i.sku.toLowerCase().includes(q)
        );
      }

      set({
        inventory: filtered,
        isLoading: false,
      });
    } catch (error: any) {
      console.error('Error loading inventory:', error);
      set({ error: error.message || 'Failed to load inventory', isLoading: false });
    }
  },

  updateStock: async (productId, newStock) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('inventory')
        .update({ quantity: newStock, updated_at: new Date().toISOString() })
        .eq('product_id', productId);
        
      if (error) throw error;
      
      set((state) => ({
        inventory: state.inventory.map(i => {
          if (i.productId === productId) {
            const status = newStock === 0 ? 'out_of_stock' : newStock <= i.lowStockThreshold ? 'low_stock' : 'in_stock';
            return { ...i, currentStock: newStock, status, lastUpdated: new Date().toISOString() };
          }
          return i;
        }),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Error updating stock:', error);
      set({ error: error.message || 'Failed to update stock', isLoading: false });
    }
  }
}));
