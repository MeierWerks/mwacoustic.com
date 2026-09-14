# Bennett's requests — running checklist (2026-09-14)

## meierwerks.com (parent)
- [x] Scope all three sites, gather every asset, report gaps
- [x] Review folder of all emailed assets incl. Diane's layout docs (Desktop → MW-Website-Assets-Review)
- [x] Build from the brand book + Diane's copy, no new copy
- [x] Division logos: fix low-res / border issues
- [x] Header: MeierWerks wordmark right of the stamp, tight
- [x] Remove "Products to come"
- [x] WRKS strip reworded (Bennett's wording)
- [x] Publish on the real domain (GitHub Pages + DNS + HTTPS)
- [x] Division logos wrong on live site → final delivered marks pushed live
- [x] Favicon = circular MW mark filling the circle

## MW Acoustics
- [x] Build per Diane's doc: Home · About · Products (dropdown: Ferrite/Alnico/Neo/Field Coil, only Neo live; Neo One/Two/Three) · Software (SDS) · Videos · Contact
- [ ] Media page — no content from Diane yet (omitted)
- [x] SDS section uses real software screenshots (+ Parts Express / Dayton components)
- [x] Hero is not the feet render
- [x] Logo: dark green, newest version, from the company assets folder, no colour inside the MW circle — awaiting Bennett's screenshot to confirm
- [x] Favicon = circular MW mark
- [x] SDS logo + copy separated from the screenshot (scrim / shadow)
- [x] Neo One in the trio: ALONE, without the multicell horn (dark studio render)
- [x] Neo Two / Three: black satin cloth over the Neo One dimensions, dark photo studio, black cyc, top-down light — inspected against the real render until it reads
- [x] Use Bennett's new SDS screenshots (Workshop render + Crossover schematic)
- [x] "Fresh and Blended" section + rest of site: stop repeating the same renders — different image everywhere
- [x] Move the Privacy page from meierwerks.com into MW Acoustics (owner of SDS); remove Privacy from the MeierWerks site
- [x] Products/Neo line: no Neo One mark unless it sits beside Neo One; drop "Four lines, one launching now"; Neo section carries no mention/images of the other lines; Ferrite / Alnico / Field Coil shown at the bottom with tight, near-abstract photography of the actual magnet materials (real photos if licensable, else generated)
- [x] Republish artifact for review
- [x] Software: "Download on the App Store" button (hero, split CTA, home SDS hero) → apps.apple.com id6788087317; note that SDS is a desktop app, iOS companion has limited capability, full functionality needs desktop
- [x] Neo-Three description: drop "floor model"; now "the flagship of the Neo line, offering uncompromised build quality and fidelity for the most discerning listener"
- [x] Neo trio v2 (Bennett: drapes read as 2D blobs): Neo One = standalone three-quarter (iso) view; Neo Two ≈ half the previous size; covered shapes rebuilt from the same camera with real 3D shading
- [x] Software page: flesh out Process (the SDS workflow), Specs (WRKS physics engines, what each does and why), Compatibility (Apple-silicon Macs from M1, iOS companion), plus a differentiation checklist vs the competition (REW, VituixCAD, Hornresp, …) — Bennett, 2026-09-14
- [x] Parent site: division tile/name click through to the division's site when one exists (MW Acoustics → mwacoustic.com); built + committed, goes live when mwacoustic.com is deployed
- [x] Parent site: division colours reassigned (Acoustics green · Heavy yellow · Deep Learning light green · Magnetics red · Composites tan · Additive blue) — live
- [x] Parent + MWA footer: transparent KO stamp+wordmark (black plate removed) — live on meierwerks.com
- [x] MW Acoustics LIVE on mwacoustic.com (2026-09-14 evening): Squarespace defaults deleted, 4 GitHub A records + www CNAME added, public resolvers answer GitHub IPs, site serves over HTTP from GitHub; HTTPS certificate approved for apex + www, https_enforced=true. Canonical host = mwacoustic.com (www redirects). Note: stale 4-hour DNS caches on Bennett's Mac caused an apex↔www redirect loop for ~1h after the switch.
- [x] Favicon: circle mark cropped edge-to-edge + 32/192/Apple-touch PNGs, both sites (Safari still paints its own light tile behind any transparent icon)
- [x] Neo Two/Three: cloth made opaque — no product detail visible through it
- [x] Parent WRKS strip: delivered WRKS colour logo + delivered "POWERED BY WRKS" lockup artwork (no typed heading) — live
- [x] MWA Software › Specs: delivered WRKS colour logo above "Powered by WRKS" — live on Pages, in artifact
- [x] Press page (was Videos): embeds Bennett's YouTube feature txUsUbOb2yQ; local Neo1_final.mp4 no longer referenced

## Flags for Bennett
- Press embed = "Revolutionizing Audio: The Rise of AI Speakers" (1BIT Podcast, channel Jay's iyagi) — verified the embed plays over HTTP; caption uses the video's title.
- "How SDS compares" table: the VituixCAD / Hornresp / REW / COMSOL columns are Claude's reading of their public feature sets — Bennett to verify before the site goes live.
- Parent-site division links to https://mwacoustic.com are live and now resolve.
- meierwerks.com/privacy.html now returns 404 — update any App Store / SDS link that pointed there once mwacoustic.com is live.
- Ferrite photo is CC BY-SA 3.0 (Omegatron); the credit line under the material cards is legally required unless the photo is replaced. Alnico (CC0) and the copper coil (Pexels) need no credit.
- MW Acoustics logo version: still awaiting Bennett's confirming screenshot.
