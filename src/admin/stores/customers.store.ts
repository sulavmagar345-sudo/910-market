import { create } from 'zustand';
import type {  Customer, FilterParams  } from '../types';
import { mockCustomers } from '../data/mock-customers';

interface CustomersStore {
  customers: Customer[];
  total: number;
  isLoading: boolean;
  error: string | null;
  fetchCustomers: (params?: FilterParams) => Promise<void>;
}

export const useCustomersStore = create<CustomersStore>((set) => ({
  customers: [],
  total: 0,
  isLoading: false,
  error: null,

  fetchCustomers: async (params) => {
    set({ isLoading: true, error: null });
    try {
      await new Promise((resolve) => setTimeout(resolve, 600));
      let filtered = [...mockCustomers];
      
      if (params?.search) {
        const query = params.search.toLowerCase();
        filtered = filtered.filter(c => 
          c.name.toLowerCase().includes(query) || 
          c.phone.includes(query) || 
          (c.email && c.email.toLowerCase().includes(query))
        );
      }

      set({
        customers: filtered,
        total: filtered.length,
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to load customers', isLoading: false });
    }
  }
}));
