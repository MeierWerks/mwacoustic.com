# Session notes

## 2026-09-14 (afternoon)
- SDS hero: left scrim gradient, drop shadow on the SDS mark, text-shadow on the headline (home + software).
- Neo trio: Neo One = hero-full render; Neo Two/Three = procedural sheet-draped silhouettes of the Neo One outline (scratch script cover.py; seeds 11/23, scales .64/.92).
- Header mark = delivered acoustics file in the delivered green, clear centre. Awaiting Bennett screenshot to confirm the logo version.
- Artifact ec83d0cc v3 republished. Not deployed.
- Next: Bennett review; then domain/hosting for mwacoustic.com.

## 2026-09-15 (Claude)
- Favicon set regenerated from the green division tile (?v=2 hrefs); stale red tile-acoustics.svg removed.
- WRKS lockups → "Powered by" + WRKS logo (.poweredby); Specs lead = new caption.
- Parent site: partner marks (incl. official Inception badge), Technology rewrite, product click-through links, USAF additive photo, WRKS strip.
- Live on Pages (gh-pages = main f09045d); artifact ec83d0cc v17. Checklist in docs/CHECKLIST.md fully ticked.
- Next: Bennett to review the Technology wording and drop the Inception badge from the member portal on the Desktop if he wants that copy.

## 2026-09-17 — discoverability foundation (analytics + SEO + page weight)
- Added a measurement layer to build.py: MEASURE dict (ga4/meta_pixel/gsc_verify/bing_verify), GA4 + Meta Pixel emitters that stay silent while IDs are empty, and one delegated listener firing app_store_click / AppStoreClick on any apps.apple.com link.
- SEO: per-page meta descriptions reused verbatim from approved copy constants (invariant 1 held), full Open Graph + Twitter card set, JSON-LD Organization / SoftwareApplication (SDS) / Product (Neo One), generated sitemap.xml + robots.txt (both were 404), gstatic preconnect, and home page demoted to a single h1.
- Performance: 24 images to WebP (42 MB -> 3.1 MB); superseded originals moved to assets-src/ outside site/. Published folder 48 MB -> 11 MB. Verified zero broken refs, all pages build, home + software render correctly.
- OPEN, needs Bennett: four account IDs (GSC, GA4, Bing, Meta Pixel); approval of search-first page titles; decision on whether to add content pages (comparison / Mac / crossover guide) — all §3 of docs/DISCOVERABILITY-2026-09-17.md.
- NOT deployed (invariant 5, publishing human-gated). Working tree left dirty for review.
