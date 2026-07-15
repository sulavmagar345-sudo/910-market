-- Create admin_notifications table
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  type text NOT NULL CHECK (type IN ('order', 'inventory', 'customer', 'review', 'system', 'warning', 'payment')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false NOT NULL,
  link text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies (Admins can do everything)
CREATE POLICY "Admins can view notifications"
  ON public.admin_notifications FOR SELECT
  USING (true);

CREATE POLICY "Admins can update notifications"
  ON public.admin_notifications FOR UPDATE
  USING (true);

CREATE POLICY "Admins can delete notifications"
  ON public.admin_notifications FOR DELETE
  USING (true);

CREATE POLICY "Admins can insert notifications"
  ON public.admin_notifications FOR INSERT
  WITH CHECK (true);

-- Create a function to automatically insert a notification when a new order is placed
CREATE OR REPLACE FUNCTION public.handle_new_order_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.admin_notifications (type, title, message, link)
  VALUES (
    'order',
    'New Order Received',
    'Order ' || NEW.id || ' for रू ' || COALESCE(NEW.total_amount, 0),
    '/admin/orders/' || NEW.id
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create the trigger
DROP TRIGGER IF EXISTS on_new_order_notification ON public.orders;
CREATE TRIGGER on_new_order_notification
  AFTER INSERT ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_order_notification();

-- Seed some initial notifications for the demo
INSERT INTO public.admin_notifications (type, title, message, is_read, link)
VALUES 
  ('system', 'Welcome to 9/10 Store Admin', 'Your admin dashboard is ready to use.', false, '/admin'),
  ('inventory', 'Low Stock Alert', '8848 Premium Vodka is running low on stock.', false, '/admin/inventory');
