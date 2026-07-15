-- Seed Groceries Category and Products
DO $$
DECLARE
  v_category_id uuid;
  v_brand_coke_id uuid;
  v_brand_lays_id uuid;
  v_brand_ferrero_id uuid;
  v_product_id uuid;
  v_variant_id uuid;
BEGIN
  -- 1. Insert Category
  INSERT INTO categories (name, slug, is_active, sort_order)
  VALUES ('Groceries', 'groceries', true, 100)
  ON CONFLICT (slug) DO UPDATE SET is_active = true
  RETURNING id INTO v_category_id;

  IF v_category_id IS NULL THEN
    SELECT id INTO v_category_id FROM categories WHERE slug = 'groceries';
  END IF;

  -- 2. Insert Brands
  INSERT INTO brands (name, slug, is_active)
  VALUES ('Coca-Cola', 'coca-cola', true)
  ON CONFLICT (slug) DO UPDATE SET is_active = true
  RETURNING id INTO v_brand_coke_id;

  IF v_brand_coke_id IS NULL THEN
    SELECT id INTO v_brand_coke_id FROM brands WHERE slug = 'coca-cola';
  END IF;

  INSERT INTO brands (name, slug, is_active)
  VALUES ('Lay''s', 'lays', true)
  ON CONFLICT (slug) DO UPDATE SET is_active = true
  RETURNING id INTO v_brand_lays_id;

  IF v_brand_lays_id IS NULL THEN
    SELECT id INTO v_brand_lays_id FROM brands WHERE slug = 'lays';
  END IF;

  INSERT INTO brands (name, slug, is_active)
  VALUES ('Ferrero', 'ferrero', true)
  ON CONFLICT (slug) DO UPDATE SET is_active = true
  RETURNING id INTO v_brand_ferrero_id;

  IF v_brand_ferrero_id IS NULL THEN
    SELECT id INTO v_brand_ferrero_id FROM brands WHERE slug = 'ferrero';
  END IF;

  -- 3. Insert Products & Variants & Inventory

  -- Product A: Coca-Cola 2.25L
  INSERT INTO products (name, slug, description, short_description, price, category_id, brand_id, is_active, status)
  VALUES ('Coca-Cola 2.25L', 'coca-cola-2-25l', 'Original taste classic sparkling soft drink.', 'Original taste classic sparkling soft drink.', 250.00, v_category_id, v_brand_coke_id, true, 'active')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_product_id;

  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_variants (product_id, name, sku, price, is_active)
    VALUES (v_product_id, 'Standard', 'COKE-225L', 250.00, true)
    RETURNING id INTO v_variant_id;

    INSERT INTO inventory (product_id, variant_id, quantity, low_stock_threshold)
    VALUES (v_product_id, v_variant_id, 100, 10);
  END IF;

  -- Product B: Lay's Classic Salted
  INSERT INTO products (name, slug, description, short_description, price, category_id, brand_id, is_active, status)
  VALUES ('Lay''s Classic Salted', 'lays-classic-salted', 'Classic salted potato chips.', 'Classic salted potato chips.', 150.00, v_category_id, v_brand_lays_id, true, 'active')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_product_id;

  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_variants (product_id, name, sku, price, is_active)
    VALUES (v_product_id, 'Standard', 'LAYS-CLASSIC', 150.00, true)
    RETURNING id INTO v_variant_id;

    INSERT INTO inventory (product_id, variant_id, quantity, low_stock_threshold)
    VALUES (v_product_id, v_variant_id, 150, 15);
  END IF;

  -- Product C: Ferrero Rocher 16 Pieces
  INSERT INTO products (name, slug, description, short_description, price, category_id, brand_id, is_active, status)
  VALUES ('Ferrero Rocher 16 Pcs', 'ferrero-rocher-16-pcs', 'Fine hazelnut chocolates.', 'Fine hazelnut chocolates.', 1200.00, v_category_id, v_brand_ferrero_id, true, 'active')
  ON CONFLICT (slug) DO NOTHING
  RETURNING id INTO v_product_id;

  IF v_product_id IS NOT NULL THEN
    INSERT INTO product_variants (product_id, name, sku, price, is_active)
    VALUES (v_product_id, 'Standard', 'FERRERO-16', 1200.00, true)
    RETURNING id INTO v_variant_id;

    INSERT INTO inventory (product_id, variant_id, quantity, low_stock_threshold)
    VALUES (v_product_id, v_variant_id, 50, 5);
  END IF;

END $$;
