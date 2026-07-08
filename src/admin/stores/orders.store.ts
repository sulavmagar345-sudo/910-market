import { create } from 'zustand';
import type { Order, FilterParams } from '../types';
import { supabase } from '../../lib/supabase';

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
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `, { count: 'exact' })
        .order('created_at', { ascending: false });

      if (params?.search) {
        const q = params.search.toLowerCase();
        query = query.or(`order_number.ilike.%${q}%,customer_name.ilike.%${q}%,customer_phone.ilike.%${q}%`);
      }

      if (params?.status && params.status !== 'all') {
        query = query.eq('status', params.status as string);
      }

      const { data, error, count } = await query;
      if (error) throw error;

      const mapped: Order[] = (data || []).map(o => ({
        id: o.id,
        orderNumber: o.order_number,
        customerId: o.customer_id || '',
        customerName: o.customer_name,
        customerEmail: o.customer_email,
        customerPhone: o.customer_phone,
        status: o.status as Order['status'],
        paymentMethod: o.payment_method as any,
        paymentStatus: o.payment_status as any,
        items: (o.order_items || []).map((item: any) => ({
          id: item.id,
          productId: item.product_id || '',
          productName: item.product_name,
          productImage: undefined,
          sku: item.sku || '',
          price: Number(item.unit_price),
          quantity: item.quantity,
          total: Number(item.total),
        })),
        shippingAddress: o.shipping_address || {},
        subtotal: Number(o.subtotal),
        deliveryCharge: Number(o.shipping_cost),
        discount: Number(o.discount_amount),
        tax: Number(o.tax_amount),
        total: Number(o.total_amount),
        notes: o.notes,
        timeline: [],
        createdAt: o.created_at,
        updatedAt: o.updated_at,
      }));

      set({ orders: mapped, total: count || 0, isLoading: false });
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      set({ error: error.message || 'Failed to load orders', isLoading: false });
    }
  },

  updateOrderStatus: async (id, status) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);
      if (error) throw error;

      set((state) => ({
        orders: state.orders.map(o => o.id === id ? { ...o, status } : o),
        isLoading: false,
      }));
    } catch (error: any) {
      console.error('Error updating order status:', error);
      set({ error: error.message || 'Failed to update order status', isLoading: false });
    }
  }
}));
