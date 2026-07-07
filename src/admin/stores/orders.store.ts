import { create } from 'zustand';
import type {  Order, FilterParams  } from '../types';
import { mockOrders } from '../data/mock-orders';

interface OrdersStore {
  orders: Order[];
  total: number;
  isLoading: boolean;
  error: string | null;
  fetchOrders: (params?: FilterParams) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
}

export const useOrdersStore = create<OrdersStore>((set) => ({
  orders: [],
  total: 0,
  isLoading: false,
  error: null,

  fetchOrders: async (params) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      let filtered = [...mockOrders];
      
      if (params?.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(o => 
          o.orderNumber.toLowerCase().includes(query) || 
          o.customerName.toLowerCase().includes(query)
        );
      }

      set({
        orders: filtered,
        total: filtered.length,
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to load orders', isLoading: false });
    }
  },

  updateOrderStatus: async (id, status) => {
    set({ isLoading: true });
    try {
      await new Promise((resolve) => setTimeout(resolve, 400));
      set((state) => ({
        orders: state.orders.map(o => o.id === id ? { ...o, status } : o),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: 'Failed to update order status', isLoading: false });
    }
  }
}));
