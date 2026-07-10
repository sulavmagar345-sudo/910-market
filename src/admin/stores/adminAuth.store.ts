import { create } from 'zustand';
import { supabase } from '../../lib/supabase';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AdminAuthStore {
  adminUser: AdminUser | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initializeAdmin: () => Promise<void>;
  loginAdmin: (email: string, password: string) => Promise<void>;
  logoutAdmin: () => Promise<void>;
  checkIsAdmin: () => Promise<boolean>;
}

// Admin authentication store - handles admin-only login
export const useAdminAuthStore = create<AdminAuthStore>((set) => ({
  adminUser: null,
  isLoading: true,
  error: null,

  initializeAdmin: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Check if this user is an admin
        const { data: adminData, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', session.user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (adminData && !error) {
          // This is an admin user
          set({
            adminUser: {
              id: adminData.id,
              name: adminData.name,
              email: adminData.email,
              role: adminData.role,
            },
            isLoading: false,
          });
        } else {
          // Not an admin user - clear admin state
          set({ adminUser: null, isLoading: false });
        }
      } else {
        set({ adminUser: null, isLoading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          // Check if admin
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('*')
            .eq('id', session.user.id)
            .eq('is_active', true)
            .maybeSingle();

          if (adminData) {
            set({
              adminUser: {
                id: adminData.id,
                name: adminData.name,
                email: adminData.email,
                role: adminData.role,
              },
            });
          }
        } else if (event === 'SIGNED_OUT') {
          set({ adminUser: null });
        }
      });
    } catch (err) {
      console.error('Admin auth initialization error:', err);
      set({ isLoading: false, adminUser: null });
    }
  },

  loginAdmin: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (authError) throw authError;
      
      if (data?.user) {
        // Verify this is an admin user
        const { data: adminData, error: adminError } = await supabase
          .from('admin_users')
          .select('*')
          .eq('id', data.user.id)
          .eq('is_active', true)
          .maybeSingle();

        if (adminError || !adminData) {
          // Not an admin - sign them out immediately
          await supabase.auth.signOut();
          set({ 
            error: 'Unauthorized: This account does not have admin access.', 
            isLoading: false,
            adminUser: null
          });
          return;
        }

        // Valid admin user
        set({
          adminUser: {
            id: adminData.id,
            name: adminData.name,
            email: adminData.email,
            role: adminData.role,
          },
          isLoading: false,
          error: null,
        });
      }
    } catch (err: any) {
      set({ 
        error: err.message || 'Login failed. Please try again.', 
        isLoading: false 
      });
    }
  },

  logoutAdmin: async () => {
    set({ isLoading: true });
    await supabase.auth.signOut();
    set({ adminUser: null, isLoading: false });
  },

  checkIsAdmin: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) return false;
    
    const { data: adminData } = await supabase
      .from('admin_users')
      .select('id')
      .eq('id', session.user.id)
      .eq('is_active', true)
      .maybeSingle();
    
    return !!adminData;
  },
}));
