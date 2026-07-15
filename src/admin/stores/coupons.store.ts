import { create } from 'zustand';
import type { Coupon } from '../types';
import { supabase } from '../../lib/supabase';

interface CouponsStore {
  coupons: Coupon[];
  isLoading: boolean;
  error: string | null;
  fetchCoupons: () => Promise<void>;
  createCoupon: (coupon: Omit<Coupon, 'id' | 'usage_count'>) => Promise<void>;
  updateCouponStatus: (id: string, isActive: boolean) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
}

export const useCouponsStore = create<CouponsStore>((set) => ({
  coupons: [],
  isLoading: false,
  error: null,

  fetchCoupons: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      set({ coupons: data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch coupons', isLoading: false });
    }
  },

  createCoupon: async (coupon) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('coupons')
        .insert([{
          ...coupon,
          code: coupon.code.toUpperCase().trim()
        }]);

      if (error) throw error;
      
      // Fetch latest coupons list
      const { data, error: fetchError } = await supabase
        .from('coupons')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (fetchError) throw fetchError;
      set({ coupons: data || [], isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to create coupon', isLoading: false });
      throw err;
    }
  },

  updateCouponStatus: async (id, isActive) => {
    set({ error: null });
    try {
      const { error } = await supabase
        .from('coupons')
        .update({ is_active: isActive })
        .eq('id', id);

      if (error) throw error;
      
      set((state) => ({
        coupons: state.coupons.map((c) =>
          c.id === id ? { ...c, is_active: isActive } : c
        )
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to update coupon status' });
      throw err;
    }
  },

  deleteCoupon: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from('coupons')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set((state) => ({
        coupons: state.coupons.filter((c) => c.id !== id),
        isLoading: false
      }));
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete coupon', isLoading: false });
      throw err;
    }
  }
}));
