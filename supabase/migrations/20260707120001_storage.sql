-- Create buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('products', 'products', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('banners', 'banners', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('brands', 'brands', true) ON CONFLICT DO NOTHING;

-- Policies for public reading
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id IN ('products', 'avatars', 'banners', 'brands') );

-- Policies for authenticated users to insert/update/delete (In a real app, restrict to admins via RLS, but for now allow authenticated)
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK ( bucket_id IN ('products', 'avatars', 'banners', 'brands') );
CREATE POLICY "Auth Update" ON storage.objects FOR UPDATE TO authenticated USING ( bucket_id IN ('products', 'avatars', 'banners', 'brands') );
CREATE POLICY "Auth Delete" ON storage.objects FOR DELETE TO authenticated USING ( bucket_id IN ('products', 'avatars', 'banners', 'brands') );
