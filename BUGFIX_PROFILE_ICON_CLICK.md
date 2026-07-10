# Bug Fix: Profile Icon Not Opening Auth Modal

## Problem
When an admin was logged into the admin panel and then visited the storefront, the profile icon in the navbar did not respond to clicks. The auth modal would not open for guest users to sign up or log in.

## Root Cause
Both the customer auth store (`useAuthStore`) and admin auth store (`useAdminAuthStore`) share the same underlying Supabase session. When an admin logs in:

1. Supabase creates a session
2. Both stores detect this session
3. `useAuthStore` sets `user` with the admin's data (including `role: 'admin'`)
4. On the storefront, the profile icon's onClick handler was: `onClick={() => !user ? openAuthModal('login') : null}`
5. Since `user` exists (the admin), the condition `!user` evaluates to `false`
6. The auth modal never opens

## Solution
Changed the profile icon click handler to also open the auth modal when the user has an admin role:

**Before:**
```tsx
onClick={() => !user ? openAuthModal('login') : null}
```

**After:**
```tsx
onClick={() => (!user || user.role) ? openAuthModal('login') : null}
```

This ensures:
- Logged-out users can click to open auth modal ✓
- Admin users visiting storefront can click to open auth modal (to create a customer account) ✓
- Customer users see their profile dropdown instead of opening modal ✓

## Files Changed
- `src/components/Layout.tsx` (line 196)

## Testing
1. Log in as admin in `/admin`
2. Visit storefront homepage
3. Click profile icon in navbar
4. Auth modal should now open properly ✓

## Related Issues
- BUGFIX_ADMIN_AUTH_ISOLATION.md - Initial separation of admin/customer auth
- Shared Supabase session still affects both stores (this is expected behavior)
