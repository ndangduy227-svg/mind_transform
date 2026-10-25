# Blog loading repair — 2026-10-25

The founder reported that opening Blog repeatedly took too long and authorized repairing the live website.

## Confirmed cause

- On production, a measured homepage → Blog visit took 7.95 seconds before the first article heading appeared. Returning within the same page session took 0.39 seconds.
- The production page calls `iosljjsycgibfqecjxim.supabase.co/rest/v1/posts`. Its hostname returned NXDOMAIN using the system resolver, Cloudflare (1.1.1.1) and Google (8.8.8.8). This establishes failed DNS resolution; it does not establish whether the project was paused, removed or configured with an outdated URL.
- The installed PostgREST client retries failed GET requests after 1, 2 and 4 seconds. The old Blog waited for those attempts before displaying even the ten bundled articles.
- The five-minute content cache lives in memory and resets on reload.

## Repair

- `posts.getCached()` synchronously supplies the latest in-memory list or the bundled articles. Blog renders it on the first render, while `getAll()` refreshes CMS data in the background.
- Public list reads disable automatic retries and use a four-second abort signal. CMS success merges published records as before; CMS failure retains previously readable content.
- Concurrent list reads share one pending request. Cache invalidation advances a generation so a response started before an admin edit cannot repopulate the cache with old records.
- Search, topic filters, article navigation and authoring use the existing document model and routes. No persistent browser cache or database migration was introduced.

## Verification

- All 52 automated checks passed (25 API/data/helper checks and 27 component checks), followed by a clean production build. The existing shared-bundle size advisory remains.
- Four new regressions cover immediate discovery/search/article navigation while CMS is pending, healthy CMS updates, network failure/remount, stale-content retention and admin-invalidation races.
- Local production-build homepage → Blog inspection showed the first article in 0.19 seconds. This is a local measurement, not a production performance promise.
- Production deployment and live timings are recorded in the workspace `11_Website/Website_V1_Audit.md` after verification.

## Remaining service issue

This release removes the CMS outage from the Blog display path. It does not restore the Supabase project, change its environment variables or verify authenticated CMS, Storage, templates or lead delivery. Check the original Supabase project in its dashboard and restore it or obtain its correct public URL/key before claiming those services work. Do not invent a replacement project or migrate production data as part of this display repair.
