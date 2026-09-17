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

## 2026-09-17 — logo audit against MeierWerks Company Assets (Bennett's iCloud kit)
- Compared all 10 site marks against the official kit. Seven identical (MW circle, wordmark, SDS, Neo One, MetaGraph, MW ACOUSTICS text, WRKS-as-colour-variant). No systemic "old logo" problem.
- ONE real difference: site tile-acoustics-green.svg is DARK GREEN; the official MW-Acoustics web asset (Aug 31 2026) is CINNABAR, and Brand Guide WE02 assigns cinnabar to Acoustics.
- DECISION (Bennett, 2026-09-17, chat): KEEP THE GREEN TILE — what is live on the site stands. The official company-assets file is the one that is out of date; flag to Louise/Diane for a refreshed export. Do not "fix" this to cinnabar in future sessions.
- Two cosmetic variants noted, left alone: the site uses the stamp WITHOUT the MeierWerks lockup (footer carries the wordmark separately), and rebuilds "POWERED BY" + coloured WRKS rather than using the official single "POWERED BY WRKS" lockup.
- Official PDFs were converted to clean SVGs in /tmp/official-svg during the audit if a future session wants kit-traceable marks; nothing in the repo was changed.
