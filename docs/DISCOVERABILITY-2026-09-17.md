# Discoverability foundation — mwacoustic.com
2026-09-17 · analytics, SEO and share-preview layer · prerequisite for the SDS ad campaigns

## 1. Done (built, verified, not yet deployed)

| Item | Before | After |
|---|---|---|
| **Analytics** | None at all | GA4 + Meta Pixel hook in `build.py` (`MEASURE` dict). Empty string = tag not emitted, so nothing ships until IDs exist. |
| **Conversion event** | None | One delegated click listener fires `app_store_click` (GA4) and `AppStoreClick` (Meta Pixel) on any `apps.apple.com` link. This is the number every ad campaign gets judged on. |
| **Meta descriptions** | One boilerplate sentence on all 9 pages | Per-page, drawn verbatim from approved copy constants (invariant 1 respected — no new sentences). |
| **Share previews** | None — links pasted into Facebook, Messages or Slack rendered bare | Full Open Graph + Twitter card set per page, with per-page images. |
| **Structured data** | None | `Organization` on every page; `SoftwareApplication` (SDS, with its real feature list, OS requirements and App Store URL) on /software; `Product` (Neo One) on / and /products. |
| **sitemap.xml** | 404 | Generated from the pages dict, with lastmod and priorities. `/orders` excluded, matching its exclusion from nav and footer. |
| **robots.txt** | 404 | Allows crawling, disallows `/orders` and `/assets/portal/`, points to the sitemap. |
| **Page weight** | 48 MB published; single images up to 6.1 MB | **11 MB.** 24 images converted to WebP (42 MB → 3.1 MB), superseded originals moved to `assets-src/` outside the published folder. |
| **Heading structure** | Home page had two `<h1>` | One `<h1>` per page (home's SDS hero is now `<h2>`, styled identically). Text unchanged. |
| **Font loading** | `preconnect` to fonts.googleapis.com only | Added the `fonts.gstatic.com` preconnect that actually serves the font files. |

Alt text was already complete on every image — nothing to fix there.

## 2. Accounts — DONE 2026-09-17 (except Meta)

| Account | State |
|---|---|
| **Google Analytics 4** | Account **MeierWerks Inc.** → properties `mwacoustic.com` (**G-1T8K0LCD7F**) and `meierwerks.com` (**G-P8QJJJ9JBN**). Eastern time, USD. Both wired and **verified firing on the live sites**. |
| **Google Search Console** | `mwacoustic.com` auto-verified via the domain registrar. `meierwerks.com` verified by meta tag. **Both sitemaps submitted.** |
| **Bing Webmaster Tools** | Both sites imported from Search Console (no re-verification needed), sitemaps carried over and processing. Feeds Bing, DuckDuckGo and AI assistants. |
| **Meta Pixel** | Still empty — waits on Business Manager. **MW Acoustics only.** |

Terms accepted on Bennett's behalf, per his authorization 2026-09-17: Google Analytics ToS + GDPR data-processing terms; Bing Webmaster sign-in via Google (identity scope); Bing's read-only access to Search Console for the site import. Marketing emails declined.

### Positioning constraint (Bennett, 2026-09-17)
The two sites serve different audiences and must not be marketed the same way:
- **mwacoustic.com** — consumer-facing. Products plus SDS. **All paid ad spend lives here.**
- **meierwerks.com** — parent company: technology, military/defense, R&D, services, software. **B2B and business-to-investor.** No consumer ad targeting, and **no Meta Pixel** — its audience is reached through direct relationships, not Facebook. Note the live parent copy covers technology and materials but never says *defense*, *R&D* or *services*; that is a copy gap for Bennett and Diane, not a tagging error.

## 3. Old: needs your sign-in (superseded by §2)

| Account | Why | What I need back |
|---|---|---|
| **Google Search Console** | The only way to see what Google shows you for, which queries you appear on, and what it can't crawl. Also where the sitemap gets submitted. | The `google-site-verification` token → `MEASURE["gsc_verify"]` |
| **Google Analytics 4** | Who visits, from where, and which pages send people to the App Store. | Measurement ID `G-XXXXXXX` → `MEASURE["ga4"]` |
| **Bing Webmaster Tools** | Feeds Bing, DuckDuckGo, and increasingly the AI assistants people now ask for software recommendations. Cheap to add. | `msvalidate.01` token → `MEASURE["bing_verify"]` |
| **Meta Pixel** (from Business Manager) | Retargeting and lookalikes for the Meta campaigns. Without it, Meta optimizes blind. | Pixel ID → `MEASURE["meta_pixel"]` |

Once you hand me those four strings, it is a one-line edit and a rebuild.

## 3. Needs your approval (invariant 1: no new copy)

### 3a. Page titles and descriptions are brand-first, not search-first
Today every title reads `<Section> — MW Acoustics`. Nobody types that. The people we want are typing "speaker design software mac", "crossover design software", "winisd for mac". A title has roughly 60 characters of search real estate and we are spending all of it on the company name.

Proposed rewrites (**new copy — needs your yes, or Diane's**):

| Page | Current title | Proposed |
|---|---|---|
| /software | SDS : Speaker Design Suite — MW Acoustics | Speaker Design Software for Mac — SDS \| MW Acoustics |
| /products | Products — MW Acoustics | Neo One Loudspeakers — MW Acoustics |
| / | MW Acoustics | MW Acoustics — Speaker Design Software and Loudspeakers |
| /support | SDS Support — MW Acoustics | SDS Support and Documentation — MW Acoustics |

### 3b. There is nothing on the site for Google to rank
Word counts, excluding legal pages: home 129, about 80, products 254, press 12, contact 22. Only /software (1,146) has real substance. A nine-page brochure with no depth cannot rank for competitive terms no matter how clean the markup is.

The search demand in this niche is **bottom-of-funnel and specific**, and almost all of it is served today by forum threads and Windows-only tools. Proposed pages, in the order I would build them:

1. **"SDS vs VituixCAD vs Hornresp vs REW"** — a comparison page. The `COMPARE` table already exists on /software; give it its own indexable page. People search competitor names constantly.
2. **"Speaker design software for Mac"** — the single highest-intent phrase we can own, because the competition literally cannot serve it.
3. **Crossover design guide** — what a passive crossover is, baffle step, Zobel, L-pad. Long-tail traffic, and it demonstrates the product.
4. **Enclosure type guide** — sealed vs ported vs transmission line vs horn. Maps directly to the Enclosure workspace.
5. **Build gallery** — the four builds already pictured on /software, each as its own page with the design story.

Every one of these is new copy. Tell me whether I draft them for your and Diane's approval, or whether we stay brochure-only and let paid ads carry the whole load.

### 3c. App Store listing (separate from the site, same problem)
- Category is **Music**. Should be Graphics & Design or Productivity — it decides which App Store browse and search surfaces you can appear on at all.
- **1 rating.** Ads pointing at a one-review listing convert badly.
- The iPhone description leads with account management, not speaker design.

## 4. Order of operations

1. You create the four accounts → I wire the IDs and rebuild *(blocks everything below)*
2. Deploy (publishing is human-gated per invariant 5)
3. Submit sitemap in Search Console + Bing
4. Approve or reject §3a titles → rebuild
5. Decide on §3b content pages
6. **Only then** turn on paid ads — a campaign without the pixel is unmeasurable spend
