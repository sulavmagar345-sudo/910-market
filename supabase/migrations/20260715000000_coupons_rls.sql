-- Admin policy for coupons
CREATE POLICY "Admin can do everything on coupons" ON coupons FOR ALL USING (
  EXISTS (SELECT 1 FROM admin_users WHERE id = auth.uid() AND is_active = true)
);
