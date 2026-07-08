import { create } from 'zustand';
import { supabase } from '../../lib/supabase';

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface BrandsStore {
  brands: Brand[];
  isLoading: boolean;
  fetchBrands: () => Promise<void>;
}

export const useBrandsStore = create<BrandsStore>((set) => ({
  brands: [],
  isLoading: false,
  fetchBrands: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase.from('brands').select('id, name, slug').order('name');
    if (!error && data) {
      set({ brands: data, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  }
}));
