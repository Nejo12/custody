# Service Worker Fix - Hydration and Update Issues

## Problem Summary

The app was experiencing:

1. **Hydration errors** - Old HTML trying to hydrate with new React code
2. **Update detection failures** - Users not getting notified of new versions
3. **"Stuck on old version" behavior** - Cached HTML preventing updates

## Root Cause

The service worker (`public/sw.js`) was:

- **Caching HTML pages** (`'/'` in STATIC_ASSETS) - causing old HTML to be served after deployment
- **Caching Next.js assets** (`/_next/*`) - causing version mismatches between HTML and JS bundles
- **Using cache-first strategy** for all requests - preventing fresh content from being served

When a new version was deployed:

- Old HTML (cached) would reference old JS bundles
- New JS bundles would be deployed
- React would try to hydrate old HTML with new JS → **hydration errors**
- Users would stay on old version because cached HTML prevented update prompts

## Solution

### 1. Stop Caching HTML and Next.js Assets

**File**: `public/sw.js`

- **Removed `'/'` from STATIC_ASSETS** - no longer precaching HTML pages
- **Added `isHtml()` function** - detects HTML page requests
- **Added `isNextAsset()` function** - detects `/_next/*` paths
- **Changed fetch handler** - network-first for HTML and `/_next/*`, never cache them
- **Incremented cache version** - `v3` → `v4` to invalidate old caches

### 2. Improve Update Detection

**Files**:

- `src/components/ServiceWorkerRegister.tsx`
- `src/components/useServiceWorkerUpdate.ts`

- **Added navigation listeners** - check for updates on every page navigation
- **Intercept history.pushState/replaceState** - detect Next.js client-side navigation
- **Listen for popstate events** - detect back/forward navigation

## What Gets Cached Now

✅ **DO Cache** (cache-first):

- Static images (`/icons/*`)
- Data JSON files (`/data/*`)
- API directory responses (for offline support)
- Manifest and favicon

❌ **DON'T Cache** (network-first):

- HTML pages (any navigation request)
- Next.js assets (`/_next/*`)
- Other API endpoints (network-first with cache fallback)

## Expected Results

1. **No more hydration errors** - HTML always comes from network, matches current JS
2. **Faster update detection** - Updates checked on every navigation
3. **Reliable update prompts** - Users see update notifications immediately after deployment
4. **No "stuck on old version"** - Fresh content always served

## Testing

After deployment:

1. Check browser console for hydration errors (should be none)
2. Deploy a new version and verify update prompt appears
3. Verify navigation works correctly
4. Check that static assets still load from cache (performance)

## Cache Invalidation

The cache version was incremented from `v3` to `v4`. On first load after this change:

- Old `v3` cache will be deleted
- New `v4` cache will be created
- All users will get fresh content

## Notes

- Service worker update checks happen on: page load, navigation, focus, visibility change
- HTML and Next.js assets are never cached, only used as offline fallback
- Static assets remain cached for performance
- Update detection is now more aggressive to catch updates faster
