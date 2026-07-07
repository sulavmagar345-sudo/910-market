import { create } from 'zustand';

export interface User {
  name: string;
  email?: string;
  phone?: string;
}

export type AuthMethod = 'email' | 'phone';

interface AuthStore {
  user: User | null;
  isAuthModalOpen: boolean;
  authView: 'login' | 'signup';
  authMethod: AuthMethod;
  otpStep: boolean;
  tempPhone: string;
  
  // Actions
  openAuthModal: (view?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  setAuthView: (view: 'login' | 'signup') => void;
  setAuthMethod: (method: AuthMethod) => void;
  
  // Email Actions
  login: (email: string, pass: string) => void;
  signup: (name: string, email: string, pass: string) => void;
  
  // Phone Actions
  sendOtp: (phone: string, name?: string) => void;
  verifyOtp: (otp: string) => void;
  
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthModalOpen: false,
  authView: 'login',
  authMethod: 'email',
  otpStep: false,
  tempPhone: '',

  openAuthModal: (view = 'login') => set({ isAuthModalOpen: true, authView: view, otpStep: false, authMethod: 'email' }),
  closeAuthModal: () => set({ isAuthModalOpen: false, otpStep: false }),
  setAuthView: (view) => set({ authView: view, otpStep: false }),
  setAuthMethod: (method) => set({ authMethod: method, otpStep: false }),

  login: (email, _pass) => {
    const name = email.split('@')[0];
    set({ user: { name, email }, isAuthModalOpen: false, otpStep: false });
  },

  signup: (name, email, _pass) => {
    set({ user: { name, email }, isAuthModalOpen: false, otpStep: false });
  },
  
  sendOtp: (phone, _name) => {
    // In a real app, send OTP request to backend here
    set({ otpStep: true, tempPhone: phone });
  },
  
  verifyOtp: (_otp) => {
    // Mock OTP verification
    const phone = get().tempPhone;
    set({ 
      user: { name: 'User', phone }, 
      isAuthModalOpen: false, 
      otpStep: false 
    });
  },

  logout: () => {
    set({ user: null });
  },
}));
