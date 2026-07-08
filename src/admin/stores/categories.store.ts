import { create } from 'zustand';
import { supabase } from '../../lib/supabase';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoriesStore {
  categories: Category[];
  isLoading: boolean;
  fetchCategories: () => Promise<void>;
}

export const useCategoriesStore = create<CategoriesStore>((set) => ({
  categories: [],
  isLoading: false,
  fetchCategories: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase.from('categories').select('id, name, slug').order('name');
    if (!error && data) {
      set({ categories: data, isLoading: false });
    } else {
      set({ isLoading: false });
    }
  }
}));
