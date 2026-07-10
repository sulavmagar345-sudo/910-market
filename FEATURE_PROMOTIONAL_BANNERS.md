# Feature: Promotional Banners Management System

## Overview
A complete promotional banner/notice management system that allows admins to create, manage, and display promotional banners to all website visitors (logged in or logged out). Banners appear as full-screen modal popups when users visit the storefront.

## Features Implemented

### 1. Database Structure
- **Table**: `promotional_banners`
- **Fields**:
  - `id`: UUID (primary key)
  - `title`: Banner title (required)
  - `description`: Optional description
  - `image_url`: Banner image URL (required)
  - `link_url`: Optional click destination
  - `link_text`: Optional button text (default: "Learn More")
  - `is_active`: Toggle banner on/off
  - `start_date`: When banner should start showing (optional)
  - `end_date`: When banner should stop showing (optional)
  - `priority`: Display order (higher priority shown first)
  - `created_at`, `updated_at`, `created_by`: Audit fields

### 2. Admin Panel Features
**Location**: `/admin/banners`

**Capabilities**:
- ✅ Create new promotional banners
- ✅ Upload banner images or use image URLs
- ✅ Edit existing banners
- ✅ Delete banners
- ✅ Activate/deactivate banners with one click
- ✅ Set priority (higher priority banners show first)
- ✅ Schedule banners with start/end dates
- ✅ Add clickable links with custom button text
- ✅ Preview banner images before saving
- ✅ View all banners in a list with status indicators

### 3. Storefront Display
**Component**: `PromotionalBanner.tsx`

**Behavior**:
- Automatically displays active banners as full-screen modals
- Only shows banners within their scheduled date range
- Shows highest priority banner first
- Respects "Don't show this again" preference (stored in localStorage)
- Auto-refreshes every 60 seconds to check for new banners
- Clickable banner image if link URL is provided
- Beautiful fade-in animation with backdrop blur
- Mobile-responsive design

**User Controls**:
- ✅ Close button (top-right X)
- ✅ "Close" button (bottom)
- ✅ "Don't show this again" option
- ✅ Action button (if link_url provided)

### 4. Security & Permissions
- **RLS Policies**:
  - Public can view active banners within date range
  - Only admins can create/edit/delete banners
  - Banner visibility automatically controlled by `is_active`, `start_date`, and `end_date`

## Usage Instructions

### For Admins:

1. **Navigate to Banners**:
   - Log into admin panel
   - Click "Banners" in the Marketing section of the sidebar

2. **Create a Banner**:
   - Click "Add Banner" button
   - Enter title (e.g., "Summer Sale - 50% Off")
   - Add description (optional)
   - Upload an image or enter image URL (recommended: 1200x400px)
   - Add link URL if you want the banner to be clickable
   - Set link button text (e.g., "Shop Now", "Learn More")
   - Set priority (higher numbers show first)
   - Set start/end dates for scheduling (optional)
   - Check "Active" to enable the banner
   - Click "Create"

3. **Edit a Banner**:
   - Click "Edit" button on any banner
   - Modify fields as needed
   - Click "Update"

4. **Activate/Deactivate**:
   - Click "Activate" or "Deactivate" button on any banner
   - Changes take effect immediately

5. **Delete a Banner**:
   - Click "Delete" button
   - Confirm deletion

### For Users:
- Banner automatically appears when visiting the website
- Click anywhere outside the banner or the X button to close
- Click "Don't show this again" to permanently dismiss that specific banner
- If banner has a link, clicking the banner image or action button opens the link

## Technical Details

### Files Created:
1. **Database**:
   - `supabase/migrations/20260707120006_promotional_banners.sql`

2. **Admin Panel**:
   - `src/admin/pages/banners/BannersPage.tsx` - Main banners management page
   - `src/admin/components/banners/BannerFormModal.tsx` - Create/edit banner form

3. **Storefront**:
   - `src/components/PromotionalBanner.tsx` - Banner display modal

4. **Routes & Navigation**:
   - Updated `src/admin/routes/index.tsx` - Added banners route
   - Updated `src/admin/components/layout/Sidebar.tsx` - Added Banners menu item
   - Updated `src/App.tsx` - Integrated PromotionalBanner component

### Image Requirements:
- **Recommended size**: 1200x400px (landscape)
- **Format**: JPG, PNG, WebP
- **Max file size**: Determined by Supabase storage limits
- Can upload directly or use external image URL

### LocalStorage Key:
- `dismissedBanners`: Array of banner IDs that user has dismissed

### Banner Display Logic:
1. Fetch active banners (`is_active = true`)
2. Filter by date range (current date between `start_date` and `end_date`)
3. Exclude dismissed banners (from localStorage)
4. Sort by priority (DESC) then created_at (DESC)
5. Show highest priority banner first

## Example Promotional Banner Scenarios

### 1. Flash Sale
- **Title**: "24 Hour Flash Sale!"
- **Description**: "Get 40% off all products"
- **Link**: `https://yoursite.com/sale`
- **Link Text**: "Shop Now"
- **Start Date**: Today
- **End Date**: Tomorrow
- **Priority**: 10 (urgent)

### 2. New Product Launch
- **Title**: "New Premium Whisky Collection"
- **Description**: "Discover our exclusive Highland selection"
- **Link**: `https://yoursite.com/new-arrivals`
- **Link Text**: "Explore Collection"
- **Start Date**: Launch date
- **End Date**: 1 week later
- **Priority**: 5

### 3. Holiday Notice
- **Title**: "Holiday Delivery Schedule"
- **Description**: "Check our updated delivery times"
- **Link**: None (info only)
- **Start Date**: 3 days before holiday
- **End Date**: Holiday date
- **Priority**: 8

## Migration Steps

To apply this feature to your Supabase database:

```bash
# Apply the migration
supabase db push

# Or if using Supabase CLI locally:
supabase migration up
```

Or manually run the SQL from:
`supabase/migrations/20260707120006_promotional_banners.sql`

## Testing Checklist

### Admin Panel:
- [ ] Can create new banner with image upload
- [ ] Can create new banner with image URL
- [ ] Can edit existing banner
- [ ] Can delete banner
- [ ] Can toggle active/inactive status
- [ ] Date range validation works
- [ ] Priority sorting works
- [ ] Image preview displays correctly

### Storefront:
- [ ] Banner appears on page load
- [ ] Banner shows only when active
- [ ] Banner respects date range
- [ ] "Don't show again" works
- [ ] Link button works (opens in new tab)
- [ ] Banner dismisses properly
- [ ] Multiple banners show in priority order
- [ ] Works on mobile devices
- [ ] Animation smooth on all devices

## Future Enhancements (Optional)

- [ ] Banner analytics (views, clicks)
- [ ] A/B testing support
- [ ] Multiple banners carousel
- [ ] Geolocation targeting
- [ ] User segment targeting (logged in vs logged out)
- [ ] Banner templates library
- [ ] Video banner support
- [ ] Countdown timer support

## Notes
- Banners are cached in browser for 60 seconds between checks
- Dismissed banners are stored in browser localStorage (per device)
- Clearing browser data will show dismissed banners again
- Banners work for all users (logged in, logged out, guests)
