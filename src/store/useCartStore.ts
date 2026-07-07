import { create } from 'zustand';

export interface CartItem {
  id: number;
  name: string;
  price: string;
  numericPrice: number;
  category: string;
  bgUrl?: string;
  bgPosition?: string;
  icon?: string;
  type: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (product: Omit<CartItem, 'quantity' | 'numericPrice'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  toggleCart: () => void;
  clearCart: () => void;
  getTotal: () => number;
}

// Helper to parse price string to number
const parsePrice = (priceStr: string) => {
  return parseInt(priceStr.replace(/[^\d]/g, ''), 10) || 0;
};

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isCartOpen: false,
  
  addItem: (product) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.id === product.id);
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          ),
        };
      }
      return {
        items: [...state.items, { ...product, quantity: 1, numericPrice: parsePrice(product.price) }],
      };
    });
  },
  
  removeItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    }));
  },
  
  updateQuantity: (id, quantity) => {
    set((state) => ({
      items: quantity <= 0 
        ? state.items.filter((item) => item.id !== id)
        : state.items.map((item) => (item.id === id ? { ...item, quantity } : item)),
    }));
  },
  
  toggleCart: () => {
    set((state) => ({ isCartOpen: !state.isCartOpen }));
  },
  
  clearCart: () => {
    set({ items: [] });
  },
  
  getTotal: () => {
    return get().items.reduce((total, item) => total + item.numericPrice * item.quantity, 0);
  },
}));
