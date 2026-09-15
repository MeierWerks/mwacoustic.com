#!/usr/bin/env python3
"""Assemble mwacoustic.com from Diane Meier's 'MW Acoustics Website' doc (Sep 10 2026) + Brand Guide WE02. No new copy — see COPY-SOURCES.md."""
import html, pathlib, re, hashlib
ROOT=pathlib.Path(__file__).parent; SITE=ROOT/"site"; E=html.escape
NAV=[("Home","index.html"),("About","about.html"),("Products","products.html"),("Software","software.html"),("Press","press.html"),("Contact","contact.html")]
LINES=[  # Bennett, "Speaker Hardware products" email 2026-09-10; only Neodymium is live
 ("Ferrite","ferrite",False),("Alnico","alnico",False),("Neodymium","neodymium",True),("Field Coil","fieldcoil",False)]
COMPONENTS=["dayton-rs180-8.jpg","dayton-rs225-8.jpg","dayton-nd25fa-4.jpg","dayton-ps95-8.jpg","dayton-rs100-4.jpg","dayton-dc28f-8.jpg"]
ATTRS=["Neodymium Magnet topology","Carbon Fiber diaphragms on all drivers","Transmission line nested cabinet","Advanced 3D Printing","CNC Machined Aluminum","Constrained layer damping","Acoustic Lens and Horn"]

def nav_html(current):
    items=[]
    for l,h in NAV:
        cur=' aria-current="page"' if h==current else ''
        if l=="Products":
            menu="".join(
                f'<li><a href="products.html#{s}">{E(n)}</a></li>' if live else
                f'<li><a class="soon" href="products.html#{s}" aria-disabled="true">{E(n)}<small>Coming soon</small></a></li>'
                for n,s,live in LINES)
            items.append(f'<li><a href="{h}"{cur}>Products</a><ul class="menu">{menu}</ul></li>')
        else: items.append(f'<li><a href="{h}"{cur}>{E(l)}</a></li>')
    return "".join(items)

CSS_VER=hashlib.md5((SITE/"assets/styles.css").read_bytes()).hexdigest()[:8]
def shell(title, body, current=None, desc="MW Acoustics. A Completely Fresh and Blended Take on Audio."):
    return f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{E(title)}</title><meta name="description" content="{E(desc)}"><meta name="theme-color" content="#121211">
<link rel="icon" href="favicon.ico?v=2" sizes="any"><link rel="icon" href="assets/logos/tile-acoustics-green.svg?v=2" type="image/svg+xml"><link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png?v=2"><link rel="icon" type="image/png" sizes="192x192" href="icon-192.png?v=2"><link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png?v=2">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&family=Jost:ital,wght@0,500;1,500&display=swap">
<link rel="stylesheet" href="assets/styles.css?v={CSS_VER}"></head>
<body>
<header class="site-header"><div class="wrap">
<a class="brand" href="index.html" aria-label="MW Acoustics home"><img class="tile" src="assets/logos/tile-acoustics-green.svg" alt=""><img class="divname" src="assets/logos/division-acoustics-white.svg" alt="MW Acoustics"></a>
<nav aria-label="Primary"><ul class="nav">{nav_html(current)}</ul></nav>
</div></header>
<main>{body}</main>
<footer class="site-footer"><div class="wrap">
<img src="assets/logos/mw-stamp+wordmark-white.svg" alt="MeierWerks">
<div><ul>{"".join(f'<li><a href="{h}">{E(l)}</a></li>' for l,h in NAV)}<li><a href="privacy.html">Privacy</a></li><li><a href="https://meierwerks.com/">MeierWerks</a></li></ul>
<p class="fine">MW Acoustics is a division of MeierWerks Inc. &nbsp;·&nbsp; Kent, CT USA &nbsp;·&nbsp; <a href="mailto:info@meierwerks.com">info@meierwerks.com</a></p></div>
<div class="right">© MeierWerks Inc. All rights reserved.</div>
</div></footer>
</body></html>'''

ABOUT_H="MW Acoustics. A Completely Fresh and Blended Take on Audio"
ABOUT_P=["Developing both hardware and software with an ear to heritage quality and an eye to next-generation modern efficiency and use.",
 "Our speakers incorporate new and patented materials from horn design to composites, with completely fresh behaviors in manufacturing to push the boundaries of what’s possible and blended with an unsurpassed quality of sound.",
 "While our software solutions are powered by our own WRKS engine, we have software solutions that allow anyone – from layman to expert – to coordinate process, data, design and real-time information."]
NEO_P=["MW’s Neo line incorporates new and patented materials from horn design to composites, with completely fresh behaviors in manufacturing. Neo is designed to push the boundaries of what’s possible when the newest technologies are blended with heritage techniques – all toward an unsurpassed quality of sound.",
 "Our Neo line incorporates: Neodymium Magnet Technology. Carbon Fiber diaphragms on all drivers. Transmission line nested cabinet. Advanced 3D Printing. CNC Machined Jewel-Quality Aluminum. Constrained layer damping. Acoustic Lens and Horn."]
NEO1_P="Neo-One, the first of the speakers to be released is a mid-sized floor standing speaker with jewel-like detailing, an elegant shape suggesting both retro and future, jewel-like aluminum feet and details, and a spectacular hand-polished finish. All designed in the service of an unparalleled “in-the-air” sound quality that’s second to none."
NEO2="A brilliant bookshelf model"
NEO3="Neo-Three is the flagship of the Neo line, offering uncompromised build quality and fidelity for the most discerning listener."  # Bennett, chat, 2026-09-14 (replaces Diane's "larger floor model" line)
SDS_H1="All the Tools, Products, Tests, and Visualized Process to Build Your Own Speaker"
SDS_P="Our Speaker Design Suite, powered by our own WRKS engine, allows anyone – from layman to expert – to build their own speaker. SDS is a highly intuitive program combining real-time data (from costs, to size, to materials) with onscreen visualization and sound testing. Quite frankly, it’s like nothing you’ve ever seen before."
SDS_H2="The world of DIY sound just took a major leap forward"
APPSTORE="https://apps.apple.com/us/app/sds-speaker-design-suite/id6788087317"   # Bennett, chat, 2026-09-14
SDS_PLATFORM="SDS is a desktop application. A companion iOS app is available with limited capability; for full functionality, use the desktop version."  # wording per Bennett, chat, 2026-09-14

def about_block(): return f'<h2>{E(ABOUT_H)}</h2><hr class="rule" style="margin-bottom:22px">' + "".join(f'<p class="lead">{E(p)}</p>' for p in ABOUT_P)

home=f'''
<section class="hero-photo"><img src="assets/img/hero-full.png" alt="Neo One" style="object-position:center 22%"><div class="caption"><p class="eyebrow" style="color:var(--gold)">MW Acoustics</p><h1>A Completely Fresh and Blended Take on Audio</h1></div></section>
<section><div class="wrap split"><div>{about_block()}<div class="buttons"><a href="about.html">About</a></div></div><img src="assets/img/neo1-light-quarter.jpg" alt="Neo One" loading="lazy"></div></section>
<section class="band-black"><div class="wrap"><p class="eyebrow" style="color:var(--gold)">Products</p><h2 style="color:var(--warm-white)">The Neo Line</h2><p class="lead" style="margin-top:14px;color:var(--warm-white)">{E(NEO_P[0])}</p>
<div class="neo-trio">
<figure><img src="assets/img/neo1-studio-quarter.jpg" alt="Neo One"><figcaption>Neo One<small>Available now</small></figcaption></figure>
<figure class="hidden"><img src="assets/img/neo-two-satin.jpg" alt="Neo Two, under cover"><figcaption>Neo Two<small>Coming soon</small></figcaption></figure>
<figure class="hidden"><img src="assets/img/neo-three-satin.jpg" alt="Neo Three, under cover"><figcaption>Neo Three<small>Coming soon</small></figcaption></figure>
</div><div class="buttons"><a href="products.html">The Neo Line</a></div></div></section>
<section class="sds-hero"><img class="bg" src="assets/img/sds/sds-crossover-schematic.jpg" alt="SDS crossover workspace"><div class="over"><img src="assets/logos/sds-mark.svg" alt="SDS"><p class="eyebrow" style="color:var(--gold)">Software · SDS : Speaker Design Suite</p><h1>{E(SDS_H1)}</h1><div class="buttons"><a href="software.html">Software</a><a class="appstore" href="{APPSTORE}" rel="noopener">Download on the App Store</a></div></div></section>
'''
about=f'''
<section class="hero-photo"><img src="assets/img/cab-front.png" alt=""><div class="caption"><p class="eyebrow" style="color:var(--gold)">About</p><h1>{E(ABOUT_H)}</h1></div></section>
<section><div class="wrap split"><div>{"".join(f'<p class="lead">{E(p)}</p>' for p in ABOUT_P)}<div style="margin-top:22px"><img src="assets/logos/powered-by-wrks-black.svg" alt="Powered by WRKS" style="height:22px;width:auto"></div></div><img src="assets/img/cab-internal.png" alt="" loading="lazy"></div></section>
'''
lines_html="".join(
  f'<a class="line-card{" live" if live else ""}" href="#{s}"><img src="assets/img/range/{s}-floorstander.png" alt=""><div class="cap"><div class="nm">{E(n)}</div>' + ('<div class="sub">The Neo Line</div>' if live else '<span class="soon-pill">Coming soon</span>') + '</div></a>'
  for n,s,live in LINES)
products=f'''
<section id="neodymium" class="band-black"><div class="wrap"><p class="eyebrow" style="color:var(--gold)">Products</p><h1 style="color:var(--warm-white);font-size:clamp(40px,5.5vw,76px)">The Neo Line</h1>
<p class="lead" style="margin-top:14px;color:var(--warm-white)">{E(NEO_P[0])}</p><p style="color:var(--warm-white)">{E(NEO_P[1])}</p>
<ul class="attrs" style="--c:var(--warm-white)">{"".join(f'<li style="border-color:var(--silver);color:var(--warm-white)"><span class="n">{i:02d}</span>{E(a)}</li>' for i,a in enumerate(ATTRS,1))}</ul>
<div class="neo-trio">
<figure><img src="assets/img/neo1-studio-quarter.jpg" alt="Neo One"><figcaption>Neo One<small>Available now</small></figcaption></figure>
<figure class="hidden"><img src="assets/img/neo-two-satin.jpg" alt="Neo Two, under cover"><figcaption>Neo Two<small>Coming soon</small></figcaption></figure>
<figure class="hidden"><img src="assets/img/neo-three-satin.jpg" alt="Neo Three, under cover"><figcaption>Neo Three<small>Coming soon</small></figcaption></figure>
</div></div></section>
<section id="neo-one"><div class="wrap"><div style="display:flex;align-items:center;gap:22px;flex-wrap:wrap"><img src="assets/logos/neo-one-mark.svg" alt="NEO • ONE" style="width:120px;height:auto"><div><p class="eyebrow">Neo One</p><h2>Neo-One</h2></div></div><hr class="rule" style="margin-bottom:22px"><p class="lead">{E(NEO1_P)}</p>
<div class="gallery"><img class="wide" src="assets/img/neo1-studio-above.jpg" alt="Neo One" loading="lazy" style="object-position:center 40%"><img src="assets/img/neo1-studio-side.jpg" alt="" loading="lazy"><img src="assets/img/neo1-light-rear.jpg" alt="" loading="lazy"><img src="assets/img/cab-front.png" alt="" loading="lazy"><img src="assets/img/cab-internal.png" alt="" loading="lazy"><img src="assets/img/cab-assembly-v85.png" alt="" loading="lazy"></div>
<p class="label" style="margin-top:36px">Coming soon</p>
<div class="coming"><div class="item"><div class="nm">Neo-Two</div><p>{E(NEO2)}</p></div><div class="item"><div class="nm">Neo-Three</div><p>{E(NEO3)}</p></div></div>
<div class="buttons"><a href="contact.html">Inquire</a></div></div></section>
<section class="tight" style="border-top:1px solid var(--rule)"><div class="wrap"><p class="eyebrow">Products</p><h2>Coming soon</h2><hr class="rule">
<div class="lines lines-3">{"".join(f'<a class="line-card" id="{s}" href="#{s}"><img src="assets/img/materials/{s}.jpg" alt="{E(n)} magnet material"><div class="cap"><div class="nm">{E(n)}</div><span class="soon-pill">Coming soon</span></div></a>' for n,s,live in LINES if not live)}</div>
</div></section>
'''


# ---------- Software page: Process / Specs / Compatibility (Bennett, chat, 2026-09-14; facts from the SDS repo docs/81, docs/44, docs/47, project.yml, MW-iOS-App-Scope) ----------
PROCESS=[("Drivers","Pick a driver from the catalog, type in your own Thiele-Small set, trace a manufacturer datasheet PDF, or load FRD and ZMA measurements."),
 ("Crossover","Schematic, live response and dispersion in one document. Choose a filter family from the encyclopedia, tune components, auto-fit ideal to real parts, and read summed SPL, phase, group delay, impedance and the CTA-2034 spinorama as you work."),
 ("Enclosure","Sealed, vented, passive radiator, bandpass, isobaric, transmission line, horn or open baffle. Dial volume and tuning while loading, excursion and port velocity update live."),
 ("Workshop","The 3-D cabinet and fabrication space: materials, finishes, bracing, imported CAD, bill of materials, cut files and a price for the build."),
 ("Simulate","The FEM / BEM cockpit, in six steps: cancellation, diffraction, internal resonance, panel resonance, system radiation and distortion."),
 ("Measure","Close the loop. Capture or import a measurement, gate it, compare measured against predicted, and refine the design.")]
SPECS=[("Crossover and network","Exact nodal (MNA) circuit solver · Butterworth, Linkwitz-Riley and Bessel targets · ladder synthesis to real component values · Zobel and L-pad networks fitted to the measured impedance · filter-topology optimizer · Nelder-Mead auto-fit · CMA-ES, coordinate-descent and NSGA-II multi-objective search with a Pareto trade-off front · active / DSP crossovers with biquad export"),
 ("Enclosures","Sealed, bass reflex, bandpass, passive radiator, isobaric, transmission line, horn and open baffle · Helmholtz port tuning and auto-sizing · ABCD two-port composition for lines and horns · radiation impedance · port flow-noise (chuffing) estimate"),
 ("Horns","Compression-driver horn engine · Western Electric / Altec-style multicell horns · constant-directivity and sculpted-horn solvers · front-loaded horn family · BEM-derived mouth loading · flat-pattern development for fabrication"),
 ("Directivity and diffraction","Analytic baffle diffraction and baffle step · BEM-solved diffraction fed back into the design chart · polar engine with the full CTA-2034 spinorama · directivity balloons · source-cancellation field across every radiating aperture"),
 ("FEM / BEM","2-D exterior BEM validated to under 1 % against analytic solutions · 3-D Helmholtz BEM · interior standing-wave modes · solid-elasticity modal analysis of the assembled cabinet · panel modal solvers · GMRES iterative solver for large meshes"),
 ("Cabinet, materials and structure","In-cabinet coloration transfer per driver · two-way fluid-structure coupling between air and panels · panel radiation · modal decay (ringing) in the time domain · viscous and thermal boundary-layer loss in ports and slots · Johnson-Champoux-Allard model for stuffing · material library with finite wall impedance · structural attachment of hardware and horns · physics-placed bracing, FEM-revalidated"),
 ("Room","Image-source room prediction at the listening position · geometric ray acoustics to any reflection order · placement guidance"),
 ("Large signal","Nonlinear motor: Bl(x), Cms(x), Le(x,i) · suspension nonlinearity · voice-coil thermal model and power compression · magnetostatic solve of the real magnetic circuit · time-domain coupled solver · excursion, port-velocity and power safety gates"),
 ("Time alignment and phase","Frequency-dependent acoustic centre · minimum-phase derivation (Hilbert) · complex acoustic summation with offsets and polarity"),
 ("Measurement","Sweep, RTA, cumulative spectral decay and impedance capture · calibrated microphone profiles · FRD / ZMA import · measured-versus-predicted reconciliation"),
 ("Datasheets and catalog","Datasheet PDF reading: text extraction plus curve tracing with axis calibration and confidence scoring · 340-plus Parts Express / Dayton driver records · live bill of materials with indicative pricing"),
 ("Rendering and fabrication","Metal path-traced photoreal rendering · DXF, STL and STEP cut files from one part list with joinery, pockets and bevels · every exported part checked closed, orientable and positive-volume before it leaves the app"),
 ("MW-Assist","An assistant that observes the design, proposes fixes and applies them through the same actions the interface uses. AI orchestrates; it never simulates.")]
COMPETITORS=["SDS","VituixCAD","Hornresp","REW","COMSOL"]
COMPARE=[("Crossover design from measured FRD / ZMA",[1,1,0,0,0]),
 ("Sealed, vented, PR, bandpass, isobaric, TL, horn, open baffle",[1,2,1,0,2]),
 ("Horn design: compression, multicell, constant-directivity",[1,0,2,0,2]),
 ("Baffle diffraction and CTA-2034 spinorama",[1,1,0,0,2]),
 ("BEM / FEM on the real cabinet",[1,0,0,0,1]),
 ("Panel resonance, fluid-structure coupling, materials, stuffing",[1,0,0,0,1]),
 ("Large-signal motor, suspension and thermal behaviour",[1,0,0,0,2]),
 ("Measurement capture: sweep, RTA, CSD, impedance",[1,0,0,1,0]),
 ("Measured-versus-predicted reconciliation loop",[1,0,0,0,0]),
 ("3-D cabinet builder to DXF / STL / STEP cut files",[1,0,0,0,0]),
 ("Photoreal rendering",[1,0,0,0,0]),
 ("Parts catalog with live pricing and a one-click cart",[1,0,0,0,0]),
 ("Datasheet PDF reading and curve tracing",[1,0,0,0,0]),
 ("Built-in design assistant (MW-Assist)",[1,0,0,0,0]),
 ("One live document from driver to cut file",[1,0,0,0,0])]
CMP_LEGEND="● included · ◐ partial or build-it-yourself · – not offered"
COMPAT=[("Mac","Apple silicon Mac (M1 or later) running macOS 14 Sonoma or later. SDS is a desktop application; the physics, optimizers, Workshop and rendering live here."),
 ("iPhone and iPad","A companion app for iOS 17 or later: measurement capture with microphone calibration, AirPlay output routing, Resources, Add-ons, orders and cart. Limited capability by design; for full functionality use the desktop version."),
 ("Microphones","Any calibrated USB measurement microphone; UMIK, ECM8000 and EMM-6 are recognised automatically. Phone-mic calibration profiles are supported."),
 ("Input","3Dconnexion SpaceMouse for six-axis viewport navigation, alongside the mouse and trackpad."),
 ("Imports","FRD and ZMA measurements, manufacturer datasheet PDFs, glTF / GLB models from Fusion 360 and other CAD, SDS project and driver files."),
 ("Exports","DXF, STL and STEP cut files, DSP biquad coefficients, measurement files and simulation reports."),
 ("Parts","Parts Express is the fulfilment partner: the bill of materials hands off to a live cart with current price and stock.")]

software=f'''
<section class="sds-hero"><img class="bg" src="assets/img/sds/sds-workshop-render.jpg" alt="SDS Workshop render"><div class="over"><img src="assets/logos/sds-mark.svg" alt="SDS"><p class="eyebrow" style="color:var(--gold)">SDS : Speaker Design Suite</p><h1>{E(SDS_H1)}</h1><div class="buttons"><a class="appstore" href="{APPSTORE}" rel="noopener">Download on the App Store</a></div></div></section>
<section><div class="wrap split"><div><p class="lead">{E(SDS_P)}</p><h2 style="margin-top:26px">{E(SDS_H2)}</h2>
<div class="buttons"><a class="appstore" href="{APPSTORE}" rel="noopener">Download on the App Store</a><a href="#process">Process</a><a href="#specs">Specs</a><a href="#compatibility">Compatibility</a></div>
<p class="platform-note">{E(SDS_PLATFORM)}</p>
<div style="margin-top:26px"><img src="assets/logos/powered-by-wrks-black.svg" alt="Powered by WRKS" style="height:22px;width:auto"></div></div>
<img src="assets/img/sds/sds-crossover-design.jpg" alt="SDS crossover design workspace" loading="lazy"></div></section>
<section class="tight" style="padding-top:0"><div class="wrap"><div class="gallery"><img class="wide" src="assets/img/sds/sds-design-gates.jpg" alt="SDS design workspace with validation gates" loading="lazy" style="aspect-ratio:2000/1584;object-fit:contain;background:#0B0C0E"><img src="assets/img/neo1-detail-horn.jpg" alt="Neo One horn assembly" loading="lazy" style="aspect-ratio:4/3;object-fit:cover"><img src="assets/img/sds/sds-filter-encyclopedia.jpg" alt="SDS filter encyclopedia" loading="lazy" style="aspect-ratio:2000/1606;object-fit:cover"><img src="assets/img/neo1-detail-cone.jpg" alt="Neo One acoustic lens" loading="lazy" style="aspect-ratio:4/3;object-fit:cover"><img src="assets/img/sds-lockup.png" alt="SDS Speaker Design Suite" loading="lazy" style="object-fit:contain;background:#fff"></div>
<div class="components">{"".join(f'<img src="assets/img/sds/components/{f}" alt="" loading="lazy">' for f in COMPONENTS)}</div></div></section>
<section id="process"><div class="wrap"><p class="eyebrow">Process</p><h2>Six workspaces. One document.</h2><hr class="rule" style="margin-bottom:26px">
<ol class="steps">{"".join(f'<li><span class="n">{i:02d}</span><div><h3>{E(n)}</h3><p>{E(t)}</p></div></li>' for i,(n,t) in enumerate(PROCESS,1))}</ol></div></section>
<section id="specs" class="band-black"><div class="wrap"><p class="eyebrow" style="color:var(--gold)">Specs</p><img src="assets/logos/wrks-color.svg" alt="WRKS" style="height:72px;width:auto;display:block;margin:6px 0 18px"><h2 style="color:var(--warm-white)">Powered by WRKS</h2>
<p class="lead" style="margin-top:14px;color:var(--warm-white);max-width:60ch">WRKS is the MeierWerks physics engine underneath SDS: a kernel of deterministic solvers that every workspace, optimizer and assistant calls. Nothing on the chart is drawn by an AI.</p>
<div class="specs">{"".join(f'<div class="spec"><h3>{E(n)}</h3><p>{E(t)}</p></div>' for n,t in SPECS)}</div>
<h3 style="color:var(--warm-white);margin-top:48px">How SDS compares</h3>
<div class="tablewrap"><table class="cmp"><thead><tr><th></th>{"".join(f'<th>{E(c)}</th>' for c in COMPETITORS)}</tr></thead><tbody>{"".join('<tr><td>'+E(r)+'</td>'+"".join('<td class="v">'+('●' if v==1 else '◐' if v==2 else '–')+'</td>' for v in vs)+'</tr>' for r,vs in COMPARE)}</tbody></table></div>
<p class="fine" style="color:var(--silver);margin-top:10px">{E(CMP_LEGEND)}</p></div></section>
<section id="compatibility"><div class="wrap"><p class="eyebrow">Compatibility</p><h2>Built for the Mac</h2><hr class="rule" style="margin-bottom:26px">
<dl class="compat">{"".join(f'<div><dt>{E(n)}</dt><dd>{E(t)}</dd></div>' for n,t in COMPAT)}</dl>
<div class="buttons" style="margin-top:28px"><a class="appstore" href="{APPSTORE}" rel="noopener">Download on the App Store</a></div></div></section>
<section class="band-black tight" id="inquire"><div class="wrap split"><div><p class="eyebrow" style="color:var(--gold)">Learn more</p><h2 style="color:var(--warm-white)">Inquire</h2></div>
<form action="mailto:info@meierwerks.com?subject=SDS%20inquiry" method="post" enctype="text/plain">
<label style="color:var(--silver)">Name<input id="sds-name" name="name" type="text" autocomplete="name" required></label>
<label style="color:var(--silver)">Email<input id="sds-email" name="email" type="email" autocomplete="email" required></label>
<label style="color:var(--silver)">Message<textarea id="sds-message" name="message" rows="4"></textarea></label>
<button type="submit" style="background:var(--cinnabar)">Send</button></form></div></section>
'''
videos='''
<section><div class="wrap"><p class="eyebrow">Press</p><h1 style="font-size:clamp(40px,5.5vw,76px)">Press</h1><hr class="rule">
<div class="videos"><div><div class="yt"><iframe src="https://www.youtube-nocookie.com/embed/txUsUbOb2yQ" title="Revolutionizing Audio: The Rise of AI Speakers" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe></div><p class="label label">Revolutionizing Audio: The Rise of AI Speakers · 1BIT Podcast</p></div></div></div></section>
'''
contact='''
<section><div class="wrap"><p class="eyebrow">MW Acoustics</p><h1 style="font-size:clamp(40px,5.5vw,76px)">Contact</h1><hr class="rule" style="margin-bottom:40px">
<div class="contact"><dl><dt>Division</dt><dd>MW Acoustics, a division of MeierWerks Inc.</dd><dt>Location</dt><dd>Kent, CT USA</dd><dt>Email</dt><dd><a href="mailto:info@meierwerks.com">info@meierwerks.com</a></dd></dl>
<form action="mailto:info@meierwerks.com" method="post" enctype="text/plain">
<label>Name<input id="name" name="name" type="text" autocomplete="name" required></label>
<label>Email<input id="email" name="email" type="email" autocomplete="email" required></label>
<label>Subject<input id="subject" name="subject" type="text"></label>
<label>Message<textarea id="message" name="message" rows="6" required></textarea></label>
<button type="submit" style="background:var(--cinnabar)">Send</button></form></div></div></section>
'''

# ---------- Privacy (verbatim; moved from meierwerks.com — MW Acoustics owns SDS) ----------
_plines=[l.strip() for l in (ROOT/"docs/copy/privacy.txt").read_text().splitlines() if l.strip()]
_pout=[]
for _i,_l in enumerate(_plines):
    if _i==0: _pout.append(f'<h1 style="font-size:clamp(40px,5.5vw,76px)">{E(_l)}</h1>')
    elif re.match(r'^\d+\. [A-Z]', _l): _pout.append(f'<h2>{E(_l)}</h2>')
    elif _l.startswith(("Effective:","Last updated:")): _pout.append(f'<p class="meta">{E(_l)}</p>')
    else: _pout.append(f'<p>{E(_l)}</p>')
privacy=f'<section><div class="wrap legal">{"".join(_pout)}</div></section>'


pages={"index.html":("MW Acoustics",home,"index.html"),"about.html":("About — MW Acoustics",about,"about.html"),"products.html":("Products — MW Acoustics",products,"products.html"),
 "software.html":("SDS : Speaker Design Suite — MW Acoustics",software,"software.html"),"press.html":("Press — MW Acoustics",videos,"press.html"),"contact.html":("Contact — MW Acoustics",contact,"contact.html"),"privacy.html":("Privacy Policy — MW Acoustics",privacy,None)}
for fn,(t,b,cur) in pages.items(): (SITE/fn).write_text(shell(t,b,cur)); print("built",fn)
