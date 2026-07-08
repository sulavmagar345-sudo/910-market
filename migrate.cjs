const { Client } = require('pg');

const regions = [
  'ap-south-1', // Mumbai (Most likely for Nepal)
  'ap-southeast-1', // Singapore
  'us-east-1', // N. Virginia
  'us-west-1', // N. California
  'eu-central-1', // Frankfurt
  'eu-west-1', // Ireland
  'eu-west-2', // London
  'ap-northeast-1', // Tokyo
  'sa-east-1', // Sao Paulo
  'ca-central-1', // Central Canada
  'ap-southeast-2', // Sydney
  'us-east-2',
  'us-west-2'
];

async function run() {
  let connectedClient = null;

  for (const region of regions) {
    console.log(`Trying region ${region}...`);
    const client = new Client({
      host: `aws-0-${region}.pooler.supabase.com`,
      port: 6543,
      database: 'postgres',
      user: 'postgres.fuggswtcujyymtbdhlgg',
      password: 'Sul@vm@g@r234!!!**',
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000 // 5 seconds timeout
    });

    try {
      await client.connect();
      console.log(`\n✅ SUCCESSFULLY CONNECTED TO REGION: ${region}`);
      connectedClient = client;
      break;
    } catch (err) {
      console.log(`❌ Failed on ${region}. Reason: ${err.message}`);
      await client.end().catch(() => {});
    }
  }

  if (!connectedClient) {
    console.error('Could not connect to any region.');
    return;
  }

  try {
    console.log('Running database migrations...');
    const sql = `
      CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
      CREATE EXTENSION IF NOT EXISTS "pgcrypto";
      CREATE EXTENSION IF NOT EXISTS "pg_trgm";
      CREATE EXTENSION IF NOT EXISTS "unaccent";

      CREATE SEQUENCE IF NOT EXISTS order_number_seq START 1;

      CREATE OR REPLACE FUNCTION set_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = NOW();
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TABLE IF NOT EXISTS categories (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        slug text NOT NULL UNIQUE,
        description text,
        image_url text,
        image_storage_path text,
        parent_id uuid REFERENCES categories(id) ON DELETE SET NULL,
        is_active boolean DEFAULT true,
        sort_order integer DEFAULT 0,
        created_at timestamptz DEFAULT NOW(),
        updated_at timestamptz DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS brands (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        slug text NOT NULL UNIQUE,
        description text,
        logo_url text,
        logo_storage_path text,
        website text,
        is_active boolean DEFAULT true,
        sort_order integer DEFAULT 0,
        created_at timestamptz DEFAULT NOW(),
        updated_at timestamptz DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS products (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        slug text NOT NULL UNIQUE,
        description text NOT NULL DEFAULT '',
        short_description text,
        sku text UNIQUE,
        barcode text UNIQUE,
        price numeric(10,2) NOT NULL DEFAULT 0,
        compare_at_price numeric(10,2),
        cost_price numeric(10,2),
        category_id uuid REFERENCES categories(id) ON DELETE SET NULL,
        brand_id uuid REFERENCES brands(id) ON DELETE SET NULL,
        is_active boolean DEFAULT true,
        is_featured boolean DEFAULT false,
        status text DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
        tags text[] DEFAULT '{}',
        meta_title text,
        meta_description text,
        created_at timestamptz DEFAULT NOW(),
        updated_at timestamptz DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS product_variants (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        name text NOT NULL,
        sku text NOT NULL UNIQUE,
        barcode text UNIQUE,
        price numeric(10,2),
        compare_at_price numeric(10,2),
        cost_price numeric(10,2),
        weight numeric(10,2),
        options jsonb DEFAULT '{}',
        is_active boolean DEFAULT true,
        sort_order integer DEFAULT 0,
        created_at timestamptz DEFAULT NOW(),
        updated_at timestamptz DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS product_images (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
        url text NOT NULL,
        storage_path text NOT NULL,
        alt_text text,
        is_primary boolean DEFAULT false,
        sort_order integer DEFAULT 0,
        created_at timestamptz DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS inventory (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        variant_id uuid NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
        warehouse_id uuid,
        quantity integer NOT NULL DEFAULT 0,
        reserved_quantity integer NOT NULL DEFAULT 0,
        low_stock_threshold integer DEFAULT 5,
        restock_date timestamptz,
        created_at timestamptz DEFAULT NOW(),
        updated_at timestamptz DEFAULT NOW(),
        UNIQUE(variant_id, warehouse_id)
      );

      CREATE TABLE IF NOT EXISTS inventory_logs (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        inventory_id uuid REFERENCES inventory(id) ON DELETE SET NULL,
        product_id uuid REFERENCES products(id) ON DELETE CASCADE,
        variant_id uuid REFERENCES product_variants(id) ON DELETE CASCADE,
        type text NOT NULL CHECK (type IN ('add', 'remove', 'set', 'reserve', 'release')),
        quantity_change integer NOT NULL,
        previous_quantity integer NOT NULL,
        new_quantity integer NOT NULL,
        reference_type text,
        reference_id text,
        notes text,
        created_by uuid REFERENCES auth.users(id),
        created_at timestamptz DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS profiles (
        id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        name text NOT NULL DEFAULT '',
        email text,
        phone text UNIQUE,
        avatar_url text,
        avatar_storage_path text,
        loyalty_points integer DEFAULT 0,
        total_spent numeric(10,2) DEFAULT 0,
        total_orders integer DEFAULT 0,
        preferences jsonb DEFAULT '{}',
        created_at timestamptz DEFAULT NOW(),
        updated_at timestamptz DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS addresses (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        profile_id uuid NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
        label text NOT NULL DEFAULT 'Home',
        full_name text NOT NULL,
        phone text NOT NULL,
        street_address text NOT NULL,
        city text NOT NULL,
        district text NOT NULL,
        province text NOT NULL,
        landmark text,
        is_default_billing boolean DEFAULT false,
        is_default_shipping boolean DEFAULT false,
        created_at timestamptz DEFAULT NOW(),
        updated_at timestamptz DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS admin_users (
        id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        name text NOT NULL,
        email text NOT NULL UNIQUE,
        phone text,
        role text NOT NULL DEFAULT 'manager' CHECK (role IN ('superadmin', 'admin', 'manager', 'support')),
        is_active boolean DEFAULT true,
        last_login timestamptz,
        created_at timestamptz DEFAULT NOW(),
        updated_at timestamptz DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS delivery_areas (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        name text NOT NULL,
        district text NOT NULL,
        province text NOT NULL,
        delivery_charge numeric(10,2) NOT NULL DEFAULT 100,
        estimated_days text,
        is_active boolean DEFAULT true,
        created_at timestamptz DEFAULT NOW(),
        updated_at timestamptz DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS drivers (
        id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        name text NOT NULL,
        phone text NOT NULL UNIQUE,
        vehicle_type text,
        vehicle_number text,
        is_active boolean DEFAULT true,
        is_available boolean DEFAULT true,
        current_location jsonb,
        created_at timestamptz DEFAULT NOW(),
        updated_at timestamptz DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS coupons (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        code text NOT NULL UNIQUE,
        type text NOT NULL CHECK (type IN ('percentage','fixed')),
        value numeric(10,2) NOT NULL CHECK (value > 0),
        min_order_amount numeric(10,2) DEFAULT 0,
        max_discount_amount numeric(10,2),
        start_date timestamptz NOT NULL,
        end_date timestamptz NOT NULL,
        usage_limit integer,
        usage_count integer DEFAULT 0,
        is_active boolean DEFAULT true,
        created_at timestamptz DEFAULT NOW(),
        updated_at timestamptz DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS orders (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number text NOT NULL UNIQUE,
        customer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
        customer_name text NOT NULL,
        customer_email text,
        customer_phone text NOT NULL,
        shipping_address jsonb NOT NULL,
        billing_address jsonb,
        subtotal numeric(10,2) NOT NULL,
        shipping_cost numeric(10,2) NOT NULL DEFAULT 0,
        tax_amount numeric(10,2) NOT NULL DEFAULT 0,
        discount_amount numeric(10,2) NOT NULL DEFAULT 0,
        total_amount numeric(10,2) NOT NULL,
        coupon_id uuid REFERENCES coupons(id) ON DELETE SET NULL,
        status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned')),
        payment_status text NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
        payment_method text NOT NULL CHECK (payment_method IN ('cod', 'esewa', 'khalti', 'bank_transfer')),
        notes text,
        internal_notes text,
        created_at timestamptz DEFAULT NOW(),
        updated_at timestamptz DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id uuid REFERENCES products(id) ON DELETE SET NULL,
        variant_id uuid REFERENCES product_variants(id) ON DELETE SET NULL,
        product_name text NOT NULL,
        variant_name text NOT NULL,
        sku text,
        quantity integer NOT NULL CHECK (quantity > 0),
        unit_price numeric(10,2) NOT NULL,
        subtotal numeric(10,2) NOT NULL,
        discount_amount numeric(10,2) DEFAULT 0,
        total numeric(10,2) NOT NULL,
        created_at timestamptz DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS deliveries (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        driver_id uuid REFERENCES drivers(id) ON DELETE SET NULL,
        status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'picked_up', 'in_transit', 'delivered', 'failed', 'returned')),
        tracking_code text UNIQUE,
        scheduled_date date,
        actual_delivery_time timestamptz,
        notes text,
        proof_of_delivery_url text,
        created_at timestamptz DEFAULT NOW(),
        updated_at timestamptz DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS payments (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        order_id uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        amount numeric(10,2) NOT NULL,
        method text NOT NULL,
        status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'refunded')),
        transaction_id text,
        gateway_response jsonb,
        created_at timestamptz DEFAULT NOW(),
        updated_at timestamptz DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS home_banners (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        title text,
        subtitle text,
        image_url text NOT NULL,
        image_storage_path text NOT NULL,
        link_url text,
        button_text text,
        position text DEFAULT 'hero' CHECK (position IN ('hero', 'promo', 'sidebar')),
        is_active boolean DEFAULT true,
        sort_order integer DEFAULT 0,
        start_date timestamptz,
        end_date timestamptz,
        created_at timestamptz DEFAULT NOW(),
        updated_at timestamptz DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS global_settings (
        id text PRIMARY KEY,
        value jsonb NOT NULL,
        description text,
        updated_at timestamptz DEFAULT NOW(),
        updated_by uuid REFERENCES auth.users(id)
      );

      DO $$
      DECLARE
        t text;
      BEGIN
        FOR t IN
          SELECT table_name FROM information_schema.columns WHERE column_name = 'updated_at' AND table_schema = 'public'
        LOOP
          EXECUTE format('DROP TRIGGER IF EXISTS set_updated_at ON %I;', t);
          EXECUTE format('CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at();', t);
        END LOOP;
      END;
      $$ LANGUAGE plpgsql;
    `;

    await connectedClient.query(sql);
    console.log('Successfully created all tables on the correct database!');

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await connectedClient.end();
  }
}

run();
