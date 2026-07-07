import { create } from 'zustand';
import type {  InventoryItem, FilterParams  } from '../types';
import { mockInventory } from '../data/mock-inventory';

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
      await new Promise((resolve) => setTimeout(resolve, 500));
      let filtered = [...mockInventory];
      
      if (params?.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(i => 
          i.productName.toLowerCase().includes(query) || 
          i.sku.toLowerCase().includes(query)
        );
      }

      set({
        inventory: filtered,
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to load inventory', isLoading: false });
    }
  },

  updateStock: async (productId, newStock) => {
    set({ isLoading: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
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
    } catch (error) {
      set({ error: 'Failed to update stock', isLoading: false });
    }
  }
}));
