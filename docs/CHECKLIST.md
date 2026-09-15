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
- [x] Products: photo credit line removed; ferrite photo replaced with a no-attribution Pexels image (dark iron-oxide mineral close-up)
- [x] Parent Divisions page (v5): each division's mark colours itself in with a smooth vector wipe (built from the delivered tile SVG, feathered edge) as soon as the mark is fully on screen; reverses on scroll-up; forced complete at page bottom; no video on the site any more; wipe eases per animation frame so stepped scroll input still animates smoothly (v6) — live
- [x] Both sites: stylesheet URL cache-busted (fixes stale layouts in Safari)
- [x] Removed the three wood-bookshelf "SDS render" images Bennett flagged as another manufacturer's photography; Software gallery now uses tight Neo One detail crops
- [x] Parent Technology page: the acoustics stock photo (another manufacturer's driver) replaced with our own Neo One horn render
- [x] Favicon in the URL bar still showed the OLD square MW logo (Safari's cached icon from the Squarespace site) → real favicon.ico (circle mark, 16–64 px) added at both site roots + link tag; Safari also needs its favicon cache cleared
- [x] Parent Partners page: EMM Labs entry removed
- [x] Parent nav order: Divisions · Vision · Technology · Partners · Team · Contact
- [x] Parent Partners page: official marks instead of text — NVIDIA logo, FORGE logo, Connecticut Innovations mark (+ name in site type), Apple "Download on the App Store" badge — live + artifact v22
- [x] Parent Partners: official NVIDIA Inception Program member badge in place of the corporate NVIDIA logo — live + artifact v26
- [x] Parent WRKS strip: lockup flush-left with the caption (lockup SVG had 7 units of internal padding; cropped to ink), caption reworded per Bennett ("WRKS is a collection of proprietary physics and simulation engines, built into all of our software."), logo enlarged to 96 px, lockup top = logo top, caption bottom = logo bottom, 22 px gap — live + artifact v23

- [x] Parent Technology page rewritten: MW Acoustics = showcase of the group's technology in consumer products (magnetic motors, lens/horn via FEA/CFD/deep-learning simulation + CNC, nested cylindrical transmission line, additive + composite structures, CNC and global partners via Heavy); ISo-TL and SONIFoRM removed; other divisions' Applications name non-audio industries (automotive / Formula One, aerospace, defense, marine, energy); Additive = sovereign, deployable, secure slicing on any hardware; Deep Learning = alignment, computational storage, beyond transformers ("scalable, cost-effective and safe AI") — live + artifact v24
- [x] Parent Technology › MW Acoustics motor entry softened: Neo line runs on third-party motors from an established driver manufacturer; MW Magnetics research informs later lines — live + artifact v25

- [x] Parent site: NEO • ONE and SDS click through to the product on mwacoustic.com (products.html#neo-one / software.html) from the home division tile, the Divisions product cards ("View … →") and the Technology SDS entry — live + artifact v27

- [x] Parent Technology › MW Additive photo: generic printer-nozzle stock replaced with a U.S. Air Force metals-shop additive-manufacturing photo (public domain, no credit needed), cropped to gloves + metal printer — live + artifact v28

- [x] MW Acoustics favicon / tab icon = the green MW Acoustics division tile (favicon.ico 16–64, PNG 32/192, apple-touch 180, SVG); parent keeps the circle mark, so the two sites are distinguishable in the tab bar and URL field — live + artifact v16

- [x] Both sites: every WRKS mention is now "Powered by" + the WRKS colour logo (parent home strip, parent product cards, MWA About, MWA Software header and Specs); the separate WRKS logo above a "Powered by WRKS" line and the lockup artwork are retired; Specs lead = the new caption — live + artifacts v29 / v17

- [x] Parent home hero: Bennett's "Evening Mist v1" drone footage behind the headline — 17 s cross-faded 1080p loop (4.9 MB), muted autoplay, poster still on phones and for reduced-motion; headline cream over a dark scrim — live + artifact v30
- [x] Parent Technology › Additive photo replaced again with an image that IS 3D printing: U.S. Marine holding a fresh print on its build plate (public domain) — live + artifact v30
- [x] "Powered by" lockups rebuilt from the delivered artwork: POWERED BY cap height = WRKS logo height, gap 0.3× height, identical on every machine (no live text) — both sites live + artifacts v31 / v18

- [x] MWA Software hero: the Iso/Front/Back… view buttons and the Look-around pill were half-cut at the top of the crop; painted out of the Workshop render's flat backdrop (sds-workshop-render-v2.jpg) so no UI text shows at any viewport — live + artifact v19

- [x] MWA Software page: device is now a MacBook (lid + aluminium base with hinge lip) and cycles through all 8 workspace screenshots Bennett supplied (Drivers → Crossover → Enclosure → Workshop → Workshop scene → Simulate → Measure → Measure room); each screen flies up to reveal the next every 3.4 s, pauses off-screen, static under reduced-motion — live + artifact v21

- [x] MWA Software: the jumbled gallery replaced by one unified box — large tile = dot carousel through the 8 workspaces, two of Bennett's build renders to the right, two below, the current SDS mark in the corner; Neo One photos and the old olive SDS lockup removed from the section — live + artifact v23
- [x] MWA Software MacBook: click the screen to advance; a caption above the lid changes with the workspace (render workspace = Bennett's line) — live + artifact v23
- [x] MWA Software component strip: compression driver, midrange, woofer, capacitor, inductor, resistor across B&C, Dayton, Eminence and Jantzen (from the app's authorised supplier catalog), centred on white, with "SDS has a full catalog of verified and measured components." beneath — live + artifact v23

- [x] Both sites: clean addresses — every internal link is extensionless (mwacoustic.com/software, meierwerks.com/technology, /products#neo-one…), each page carries a canonical tag; old .html addresses still resolve; 15 live links crawled, none broken — live + artifacts v33 / v24

- [x] Diane's updated copy applied where it overlaps: About (3 paragraphs), Neo line intro, full Neo-One description, Neo-Two line, SDS paragraph with the Jay Lee pull quote and the "Engineering Studio in the Palm of Your Hand" tag line; home About-teaser trimmed to one paragraph so it no longer duplicates About — live + artifact v25
- [x] WRKS caption everywhere now ends "…built into our software and services." — both sites live + artifacts v34 / v25

- [x] Products › Neo attribute cards each carry a small image: magnetic field lines (Pexels), Bennett's carbon-fibre cone photo, his nested transmission-line render, a 3D printer close-up (Pexels), our machined aluminum ring render, an original edge-on damped-panel illustration for constrained layer damping, and Bennett's photo of the acoustic lens — live + artifact v27

- [x] Parent positioning line replaced: "Where the hand of craft meets the precision of technology." (hero, Vision page, meta description); alternates listed in the parent COPY-SOURCES.md — live + artifact v35

## Flags for Bennett
- Press embed = "Revolutionizing Audio: The Rise of AI Speakers" (1BIT Podcast, channel Jay's iyagi) — verified the embed plays over HTTP; caption uses the video's title.
- "How SDS compares" table: the VituixCAD / Hornresp / REW / COMSOL columns are Claude's reading of their public feature sets — Bennett to verify before the site goes live.
- meierwerks.com/privacy.html now returns 404 — update any App Store / SDS link that pointed there once mwacoustic.com is live.
- Photo credits: none required any more (all three material photos are CC0 / Pexels).
- Partners: the NVIDIA Inception card now carries NVIDIA's official Inception Program badge (the "badge RGB for screen" file NVIDIA gives members). If Bennett downloads the current badge from the Inception member portal, drop it on the Desktop and it will replace this copy. CT Innovations has no wordmark file online; the card pairs their circular mark with the name set in site type.
- Technology page wording was drafted from Bennett's brief (parent build.py `TECH`); read it once for anything overstated — especially the nested-TL claim ("outperforms the rectangular and square lines of the competition") and the deep-learning research items (alignment, computational storage, beyond transformers).
- Additive photo is a U.S. Marine Corps (DoD) image: public domain, but DoD policy is that its imagery must not be presented as DoD endorsement. Fine as an industry illustration; don't caption it as a customer or partner.
- New MW Acoustics favicon: Safari caches site icons aggressively. If the tab still shows the old circle: Safari › Settings › Privacy › Manage Website Data › remove mwacoustic.com, then reload; Chrome picks up the new `?v=2` URLs on its own.
- MacBook captions are Claude's drafts from the approved Process copy (plus Bennett's render line); read them once in build.py `CAP` / data-caption and strike any that overstate.
- Jay Lee quote: Diane's doc attributes "Quite frankly, it's like nothing you've ever seen before" to Jay Lee (the 1BIT Podcast host); it is now shown as a credited pull quote on the Software page. Confirm he said it and is happy to be quoted.
- Neo-Three: kept Bennett's 2026-09-14 sentence rather than Diane's new flagship line ("…an uncompromised imposing loud speaker…"). Swap if Bennett prefers Diane's.
- Diane's doc says "Software Design Suite"; the site keeps "Speaker Design Suite", the product's actual name.
