# Database Migration Instructions

## Apply the Promotional Banners Migration

You need to apply the new database migration to add the `promotional_banners` table to your Supabase database.

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Click on your project (910 market)
3. Go to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the entire contents of this file:
   `supabase/migrations/20260707120006_promotional_banners.sql`
6. Click **Run** button
7. You should see "Success. No rows returned"

### Option 2: Using Supabase CLI (If you have it installed)

```bash
# Navigate to your project directory
cd C:\Users\Acer\OneDrive\Desktop\910

# Apply all pending migrations
supabase db push
```

## Verify Migration Success

After running the migration, verify it worked:

1. Go to Supabase Dashboard → **Table Editor**
2. You should see a new table called `promotional_banners`
3. Click on it to see the columns:
   - id
   - title
   - description
   - image_url
   - link_url
   - link_text
   - is_active
   - start_date
   - end_date
   - priority
   - created_at
   - updated_at
   - created_by

## Test the Feature

Once the migration is applied:

1. **Deploy the code**: Vercel should automatically deploy the changes (already pushed to GitHub)
2. **Test Admin Panel**:
   - Go to `https://yoursite.com/admin`
   - Log in as admin
   - Click "Banners" in the Marketing section
   - Create a test banner
3. **Test Storefront**:
   - Visit `https://yoursite.com`
   - The banner should appear as a popup modal
   - Test the close and "Don't show again" buttons

## Troubleshooting

### If you see "relation promotional_banners does not exist"
- The migration hasn't been applied yet
- Follow Option 1 above to apply it manually

### If banner doesn't show on storefront
- Check that the banner is marked as "Active" in admin panel
- Check that the current date is between start_date and end_date (if set)
- Check browser console for any errors
- Clear localStorage if you clicked "Don't show this again"

### If you can't upload images
- Make sure the `product-images` storage bucket exists in Supabase
- Check that RLS policies on the bucket allow uploads
- Alternatively, use an external image URL instead

## Storage Bucket Setup (If Not Already Done)

If image upload doesn't work, create the storage bucket:

1. Go to Supabase Dashboard → **Storage**
2. Click **New bucket**
3. Name: `product-images`
4. Set to **Public**
5. Click **Create bucket**
6. Go to bucket **Policies**
7. Enable policies for authenticated users to upload

## Next Steps

After migration is successful, you can:
1. Create your first promotional banner
2. Schedule banners for specific dates
3. Use priority to control which banner shows first
4. Monitor which banners users see

Enjoy your new promotional banners feature! 🎉
