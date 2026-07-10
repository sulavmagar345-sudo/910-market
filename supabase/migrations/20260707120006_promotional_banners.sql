-- Create promotional_banners table
CREATE TABLE IF NOT EXISTS promotional_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  link_text VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add index for active banners query optimization
CREATE INDEX IF NOT EXISTS idx_promotional_banners_active ON promotional_banners(is_active, priority DESC, start_date, end_date);

-- Add RLS policies
ALTER TABLE promotional_banners ENABLE ROW LEVEL SECURITY;

-- Public can view active banners within date range
DROP POLICY IF EXISTS "Anyone can view active banners" ON promotional_banners;
CREATE POLICY "Anyone can view active banners"
  ON promotional_banners
  FOR SELECT
  USING (
    is_active = true 
    AND (start_date IS NULL OR start_date <= NOW())
    AND (end_date IS NULL OR end_date >= NOW())
  );

-- Admins can manage all banners
DROP POLICY IF EXISTS "Admins can manage banners" ON promotional_banners;
CREATE POLICY "Admins can manage banners"
  ON promotional_banners
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid()
      AND admin_users.is_active = true
    )
  );

-- Create or replace the update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create updated_at trigger
DROP TRIGGER IF EXISTS update_promotional_banners_updated_at ON promotional_banners;
CREATE TRIGGER update_promotional_banners_updated_at
  BEFORE UPDATE ON promotional_banners
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comment
COMMENT ON TABLE promotional_banners IS 'Stores promotional banners and notices that appear on the storefront';
