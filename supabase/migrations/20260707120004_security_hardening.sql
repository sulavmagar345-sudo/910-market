-- SECURITY HARDENING MIGRATION
-- Fixes RLS, adds constraints, and implements a secure order RPC

-- 1. Add database constraints
ALTER TABLE products ADD CONSTRAINT price_non_negative CHECK (price >= 0);
ALTER TABLE orders ADD CONSTRAINT total_amount_non_negative CHECK (total_amount >= 0);
ALTER TABLE orders ADD CONSTRAINT subtotal_non_negative CHECK (subtotal >= 0);

-- 2. Secure admin_users RLS
DROP POLICY IF EXISTS "Admin can do everything on admin_users" ON admin_users;
CREATE POLICY "Admin users can view admins" ON admin_users FOR SELECT USING (
  EXISTS (SELECT 1 FROM admin_users a WHERE a.id = auth.uid() AND a.is_active = true)
);
CREATE POLICY "Superadmin can manage admins" ON admin_users FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users a WHERE a.id = auth.uid() AND a.role = 'superadmin' AND a.is_active = true)
);

-- 3. Secure profiles RLS to prevent mass assignment
DROP POLICY IF EXISTS "User can update own profile" ON profiles;
-- Only allow updates to basic info. Loyalty points and totals should not be updated by users.
CREATE POLICY "User can update own profile basic info" ON profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (
  auth.uid() = id
  -- In a strict setup, we'd use a trigger to prevent updating specific columns, 
  -- but RLS covers the row. We will use a trigger to enforce column immutability for users.
);

CREATE OR REPLACE FUNCTION prevent_profile_mass_assignment()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() = NEW.id AND NOT EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true) THEN
    -- If user is updating their own profile, keep protected fields unchanged
    NEW.loyalty_points = OLD.loyalty_points;
    NEW.total_spent = OLD.total_spent;
    NEW.total_orders = OLD.total_orders;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS enforce_profile_security ON profiles;
CREATE TRIGGER enforce_profile_security
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION prevent_profile_mass_assignment();

-- 4. Secure Storage Policies
-- We need to drop the permissive Auth policies and restrict to admins
DROP POLICY IF EXISTS "Auth Insert" ON storage.objects;
DROP POLICY IF EXISTS "Auth Update" ON storage.objects;
DROP POLICY IF EXISTS "Auth Delete" ON storage.objects;

CREATE POLICY "Admin Insert Storage" ON storage.objects FOR INSERT TO authenticated WITH CHECK (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true)
);
CREATE POLICY "Admin Update Storage" ON storage.objects FOR UPDATE TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true)
);
CREATE POLICY "Admin Delete Storage" ON storage.objects FOR DELETE TO authenticated USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true)
);

-- 5. Secure Orders (Prevent Client-Side Price Trust & IDOR)
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
DROP POLICY IF EXISTS "Users can view own orders" ON orders;

-- Users can only view orders linked to their auth.uid(). 
-- Anonymous orders can only be fetched via a secure token/session if needed later.
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (
  auth.uid() = customer_id
);

-- 6. Secure Order Creation RPC (Handles Pricing & Inventory securely)
CREATE OR REPLACE FUNCTION create_secure_order(
  p_customer_id uuid,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_shipping_address jsonb,
  p_payment_method text,
  p_items jsonb -- Array of { product_id, quantity }
) RETURNS jsonb AS $$
DECLARE
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(10,2) := 0;
  v_shipping_cost numeric(10,2) := 100; -- Hardcoded for now, could be dynamic
  v_total numeric(10,2) := 0;
  v_item jsonb;
  v_product record;
  v_inventory record;
BEGIN
  -- Generate Order Number
  v_order_number := 'ORD-' || to_char(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISS');

  -- Create Draft Order
  INSERT INTO orders (
    order_number, customer_id, customer_name, customer_email, customer_phone,
    shipping_address, subtotal, shipping_cost, tax_amount, discount_amount, total_amount,
    payment_method, payment_status, status
  ) VALUES (
    v_order_number, p_customer_id, p_customer_name, p_customer_email, p_customer_phone,
    p_shipping_address, 0, v_shipping_cost, 0, 0, 0,
    p_payment_method, 'pending', 'pending'
  ) RETURNING id INTO v_order_id;

  -- Loop through items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    -- Lock product for secure read
    SELECT id, name, sku, price INTO v_product FROM products WHERE id = (v_item->>'product_id')::uuid FOR SHARE;
    
    IF NOT FOUND THEN
      RAISE EXCEPTION 'Product not found: %', v_item->>'product_id';
    END IF;

    -- Decrement Inventory securely (assuming 1 variant per product for now)
    SELECT * INTO v_inventory FROM inventory WHERE product_id = v_product.id FOR UPDATE;
    
    IF v_inventory.quantity < (v_item->>'quantity')::integer THEN
      RAISE EXCEPTION 'Insufficient stock for product: %', v_product.name;
    END IF;

    UPDATE inventory SET quantity = quantity - (v_item->>'quantity')::integer WHERE id = v_inventory.id;

    -- Insert Order Item
    INSERT INTO order_items (
      order_id, product_id, product_name, variant_name, sku, quantity, unit_price, subtotal, discount_amount, total
    ) VALUES (
      v_order_id, v_product.id, v_product.name, 'Default', v_product.sku, (v_item->>'quantity')::integer,
      v_product.price, v_product.price * (v_item->>'quantity')::integer, 0, v_product.price * (v_item->>'quantity')::integer
    );

    v_subtotal := v_subtotal + (v_product.price * (v_item->>'quantity')::integer);
  END LOOP;

  v_total := v_subtotal + v_shipping_cost;

  -- Update Final Order Totals
  UPDATE orders SET subtotal = v_subtotal, total_amount = v_total WHERE id = v_order_id;

  RETURN jsonb_build_object('id', v_order_id, 'order_number', v_order_number, 'total_amount', v_total);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
