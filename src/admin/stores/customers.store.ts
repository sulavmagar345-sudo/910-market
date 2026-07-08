import { create } from 'zustand';
import type { Customer, FilterParams } from '../types';
import { supabase } from '../../lib/supabase';

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
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (params?.search) {
        const q = params.search;
        query = query.or(`name.ilike.%${q}%,phone.ilike.%${q}%,email.ilike.%${q}%`);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      const mapped: Customer[] = (data || []).map(c => ({
        id: c.id,
        name: c.name || 'Unknown',
        email: c.email,
        phone: c.phone || '',
        avatar: c.avatar_url,
        status: 'active' as const,
        totalOrders: c.total_orders || 0,
        totalSpent: Number(c.total_spent) || 0,
        averageOrderValue: c.total_orders > 0 ? Number(c.total_spent) / c.total_orders : 0,
        lastOrderAt: undefined,
        addresses: [],
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));

      set({ customers: mapped, total: count || 0, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching customers:', error);
      set({ error: error.message || 'Failed to load customers', isLoading: false });
    }
  }
}));
