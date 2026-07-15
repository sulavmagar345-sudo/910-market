import { create } from 'zustand';
import { supabase } from '../../lib/supabase';
import type { Notification } from '../types';

interface NotificationsState {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  subscribeToNotifications: () => void;
  unsubscribeFromNotifications: () => void;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchNotifications: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedNotifications: Notification[] = data.map((n: any) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        message: n.message,
        isRead: n.is_read,
        link: n.link,
        createdAt: n.created_at,
      }));

      const unreadCount = formattedNotifications.filter((n) => !n.isRead).length;

      set({ notifications: formattedNotifications, unreadCount, isLoading: false });
    } catch (err: any) {
      console.error('Error fetching notifications:', err);
      set({ error: err.message, isLoading: false });
    }
  },

  markAsRead: async (id: string) => {
    try {
      // Optimistic update
      const { notifications } = get();
      const updated = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
      set({ 
        notifications: updated,
        unreadCount: updated.filter(n => !n.isRead).length
      });

      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking notification as read:', err);
      // Revert optimism if failed (optional, but good practice)
      get().fetchNotifications();
    }
  },

  markAllAsRead: async () => {
    try {
      const { notifications } = get();
      const updated = notifications.map(n => ({ ...n, isRead: true }));
      set({ notifications: updated, unreadCount: 0 });

      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      get().fetchNotifications();
    }
  },

  deleteNotification: async (id: string) => {
    try {
      const { notifications } = get();
      const updated = notifications.filter(n => n.id !== id);
      set({ 
        notifications: updated,
        unreadCount: updated.filter(n => !n.isRead).length
      });

      const { error } = await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error('Error deleting notification:', err);
      get().fetchNotifications();
    }
  },

  subscribeToNotifications: () => {
    const channel = supabase
      .channel('admin_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to INSERT, UPDATE, DELETE
          schema: 'public',
          table: 'admin_notifications',
        },
        (payload) => {
          console.log('Realtime notification event:', payload);
          // Easiest is to just re-fetch the list so it sorts correctly
          get().fetchNotifications();
        }
      )
      .subscribe();

    // Store channel if needed for unsubscribe, but usually we just remove all channels in unsubscribe
  },

  unsubscribeFromNotifications: () => {
    supabase.removeAllChannels();
  },
}));
