import { create } from 'zustand';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
}

export type AuthMethod = 'email' | 'phone';

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  isAuthModalOpen: boolean;
  authView: 'login' | 'signup';
  authMethod: AuthMethod;
  otpStep: boolean;
  tempPhone: string;
  
  // Actions
  initialize: () => Promise<void>;
  openAuthModal: (view?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  setAuthView: (view: 'login' | 'signup') => void;
  setAuthMethod: (method: AuthMethod) => void;
  
  // Email Actions
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string, phone: string) => Promise<void>;
  
  // Phone Actions
  sendOtp: (phone: string, name?: string) => Promise<void>;
  verifyOtp: (otp: string) => Promise<void>;
  
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isLoading: true,
  error: null,
  isAuthModalOpen: false,
  authView: 'login',
  authMethod: 'email',
  otpStep: false,
  tempPhone: '',

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Fetch profile details
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        // Check if admin
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('role')
          .eq('id', session.user.id)
          .eq('is_active', true)
          .maybeSingle();

        set({
          user: {
            id: session.user.id,
            name: profile?.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email,
            phone: profile?.phone,
            role: adminData?.role,
          },
          isLoading: false
        });
      } else {
        set({ user: null, isLoading: false });
      }

      // Listen for auth changes
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          const { data: adminData } = await supabase
            .from('admin_users')
            .select('role')
            .eq('id', session.user.id)
            .eq('is_active', true)
            .maybeSingle();

          set({
            user: {
              id: session.user.id,
              name: profile?.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email,
              phone: profile?.phone,
              role: adminData?.role,
            }
          });
        } else if (event === 'SIGNED_OUT') {
          set({ user: null });
        }
      });
    } catch (err) {
      console.error('Auth initialization error:', err);
      set({ isLoading: false });
    }
  },

  openAuthModal: (view = 'login') => set({ isAuthModalOpen: true, authView: view, otpStep: false, authMethod: 'email', error: null }),
  closeAuthModal: () => set({ isAuthModalOpen: false, otpStep: false, error: null }),
  setAuthView: (view) => set({ authView: view, otpStep: false, error: null }),
  setAuthMethod: (method) => set({ authMethod: method, otpStep: false, error: null }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      set({ error: error.message, isLoading: false });
    } else if (data?.user) {
      // Fetch profile and role directly to prevent race condition with navigation
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      const { data: adminData } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', data.user.id)
        .eq('is_active', true)
        .maybeSingle();

      set({
        user: {
          id: data.user.id,
          name: profile?.name || data.user.email?.split('@')[0] || 'User',
          email: data.user.email,
          phone: profile?.phone,
          role: adminData?.role,
        },
        isAuthModalOpen: false, 
        otpStep: false, 
        isLoading: false,
        error: null
      });
    }
  },

  signup: async (name, email, password, phone) => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, phone }
      }
    });
    
    if (error) {
      set({ error: error.message || 'Signup failed. Please try again.', isLoading: false });
    } else if (data?.user && !data?.session) {
      // Email confirmation required
      set({ error: null, isLoading: false });
      alert('Account created! Please check your email to confirm your account, then log in.');
    } else {
      // Auto-confirmed — user is logged in immediately
      set({ isAuthModalOpen: false, otpStep: false, isLoading: false, error: null });
    }
  },
  
  sendOtp: async (phone, _name) => {
    set({ isLoading: true, error: null });
    // Assuming the phone format includes the country code e.g. +977
    const { error } = await supabase.auth.signInWithOtp({
      phone,
    });
    
    if (error) {
      set({ error: error.message, isLoading: false });
    } else {
      set({ otpStep: true, tempPhone: phone, isLoading: false });
    }
  },
  
  verifyOtp: async (otp) => {
    set({ isLoading: true, error: null });
    const phone = get().tempPhone;
    
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token: otp,
      type: 'sms',
    });

    if (error) {
      set({ error: error.message, isLoading: false });
    } else {
      set({ isAuthModalOpen: false, otpStep: false, isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    await supabase.auth.signOut();
    set({ user: null, isLoading: false });
  },
}));
