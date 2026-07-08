-- Seed global settings defaults
INSERT INTO global_settings (id, value, description) VALUES
  ('store_info', '{"name":"9/10 Mart","tagline":"Premium Spirits Delivered","email":"support@910mart.com","phone":"+977-1-4000000","address":"Durbar Marg, Kathmandu 44600","currency":"NPR","currency_symbol":"रू"}', 'Store branding and contact info'),
  ('payment_methods', '{"cod":true,"esewa":true,"khalti":true}', 'Enabled payment methods'),
  ('delivery_settings', '{"base_charge":100,"free_delivery_above":5000,"estimated_days":"1-2"}', 'Delivery configuration'),
  ('tax_settings', '{"vat_enabled":false,"vat_rate":13,"pan":"123456789"}', 'Tax configuration')
ON CONFLICT (id) DO NOTHING;
