#!/usr/bin/env python3
"""Assemble mwacoustic.com from Diane Meier's 'MW Acoustics Website' doc (Sep 10 2026) + Brand Guide WE02. No new copy — see COPY-SOURCES.md."""
import html, pathlib, re
ROOT=pathlib.Path(__file__).parent; SITE=ROOT/"site"; E=html.escape
NAV=[("Home","index.html"),("About","about.html"),("Products","products.html"),("Software","software.html"),("Videos","videos.html"),("Contact","contact.html")]
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

def shell(title, body, current=None, desc="MW Acoustics. A Completely Fresh and Blended Take on Audio."):
    return f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>{E(title)}</title><meta name="description" content="{E(desc)}"><meta name="theme-color" content="#121211">
<link rel="icon" href="assets/logos/mw-circle-black.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&family=Jost:ital,wght@0,500;1,500&display=swap">
<link rel="stylesheet" href="assets/styles.css"></head>
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
<figure><img src="assets/img/neo1-studio-side.jpg" alt="Neo One"><figcaption>Neo One<small>Available now</small></figcaption></figure>
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
<figure><img src="assets/img/neo1-studio-side.jpg" alt="Neo One"><figcaption>Neo One<small>Available now</small></figcaption></figure>
<figure class="hidden"><img src="assets/img/neo-two-satin.jpg" alt="Neo Two, under cover"><figcaption>Neo Two<small>Coming soon</small></figcaption></figure>
<figure class="hidden"><img src="assets/img/neo-three-satin.jpg" alt="Neo Three, under cover"><figcaption>Neo Three<small>Coming soon</small></figcaption></figure>
</div></div></section>
<section id="neo-one"><div class="wrap"><div style="display:flex;align-items:center;gap:22px;flex-wrap:wrap"><img src="assets/logos/neo-one-mark.svg" alt="NEO • ONE" style="width:120px;height:auto"><div><p class="eyebrow">Neo One</p><h2>Neo-One</h2></div></div><hr class="rule" style="margin-bottom:22px"><p class="lead">{E(NEO1_P)}</p>
<div class="gallery"><img class="wide" src="assets/img/neo1-studio-above.jpg" alt="Neo One" loading="lazy" style="object-position:center 40%"><img src="assets/img/neo1-dark-quarter.jpg" alt="" loading="lazy"><img src="assets/img/neo1-light-rear.jpg" alt="" loading="lazy"><img src="assets/img/cab-front.png" alt="" loading="lazy"><img src="assets/img/cab-internal.png" alt="" loading="lazy"><img src="assets/img/cab-assembly-v85.png" alt="" loading="lazy"></div>
<p class="label" style="margin-top:36px">Coming soon</p>
<div class="coming"><div class="item"><div class="nm">Neo-Two</div><p>{E(NEO2)}</p></div><div class="item"><div class="nm">Neo-Three</div><p>{E(NEO3)}</p></div></div>
<div class="buttons"><a href="contact.html">Inquire</a></div></div></section>
<section class="tight" style="border-top:1px solid var(--rule)"><div class="wrap"><p class="eyebrow">Products</p><h2>Coming soon</h2><hr class="rule">
<div class="lines lines-3">{"".join(f'<a class="line-card" id="{s}" href="#{s}"><img src="assets/img/materials/{s}.jpg" alt="{E(n)} magnet material"><div class="cap"><div class="nm">{E(n)}</div><span class="soon-pill">Coming soon</span></div></a>' for n,s,live in LINES if not live)}</div>
<p class="fine" style="margin-top:14px;color:var(--muted)">Photography: ferrite magnets — Omegatron, Wikimedia Commons, CC BY-SA 3.0 (cropped) · alnico magnet — Chetvorno, Wikimedia Commons, CC0 · copper coil — Vadim Timayev, Pexels.</p></div></section>
'''

software=f'''
<section class="sds-hero"><img class="bg" src="assets/img/sds/sds-workshop-render.jpg" alt="SDS Workshop render"><div class="over"><img src="assets/logos/sds-mark.svg" alt="SDS"><p class="eyebrow" style="color:var(--gold)">SDS : Speaker Design Suite</p><h1>{E(SDS_H1)}</h1><div class="buttons"><a class="appstore" href="{APPSTORE}" rel="noopener">Download on the App Store</a></div></div></section>
<section><div class="wrap split"><div><p class="lead">{E(SDS_P)}</p><h2 style="margin-top:26px">{E(SDS_H2)}</h2>
<div class="buttons"><a class="appstore" href="{APPSTORE}" rel="noopener">Download on the App Store</a><a href="#process">Process</a><a href="#specs">Specs</a><a href="#compatibility">Compatibility</a></div>
<p class="platform-note">{E(SDS_PLATFORM)}</p>
<div style="margin-top:26px"><img src="assets/logos/powered-by-wrks-black.svg" alt="Powered by WRKS" style="height:22px;width:auto"></div></div>
<img src="assets/img/sds/sds-crossover-design.jpg" alt="SDS crossover design workspace" loading="lazy"></div></section>
<section class="tight" style="padding-top:0"><div class="wrap"><div class="gallery"><img class="wide" src="assets/img/sds/sds-design-gates.jpg" alt="SDS design workspace with validation gates" loading="lazy" style="aspect-ratio:2000/1584;object-fit:contain;background:#0B0C0E"><img src="assets/img/sds/sds-render-views.jpg" alt="SDS render views" loading="lazy" style="aspect-ratio:1430/1080;object-fit:cover"><img src="assets/img/sds/sds-filter-encyclopedia.jpg" alt="SDS filter encyclopedia" loading="lazy" style="aspect-ratio:2000/1606;object-fit:cover"><img src="assets/img/sds/sds-render-speaker.jpg" alt="Speaker rendered in SDS" loading="lazy" style="aspect-ratio:4/3;object-fit:cover"><img src="assets/img/sds-lockup.png" alt="SDS Speaker Design Suite" loading="lazy" style="object-fit:contain;background:#fff"></div>
<div class="components">{"".join(f'<img src="assets/img/sds/components/{f}" alt="" loading="lazy">' for f in COMPONENTS)}</div></div></section>
<section class="band-black tight" id="inquire"><div class="wrap split"><div><p class="eyebrow" style="color:var(--gold)">Learn more</p><h2 style="color:var(--warm-white)">Inquire</h2></div>
<form action="mailto:info@meierwerks.com?subject=SDS%20inquiry" method="post" enctype="text/plain">
<label style="color:var(--silver)">Name<input id="sds-name" name="name" type="text" autocomplete="name" required></label>
<label style="color:var(--silver)">Email<input id="sds-email" name="email" type="email" autocomplete="email" required></label>
<label style="color:var(--silver)">Message<textarea id="sds-message" name="message" rows="4"></textarea></label>
<button type="submit" style="background:var(--cinnabar)">Send</button></form></div></section>
'''
videos='''
<section><div class="wrap"><p class="eyebrow">Videos</p><h1 style="font-size:clamp(40px,5.5vw,76px)">Videos</h1><hr class="rule">
<div class="videos"><div><video controls playsinline preload="metadata" poster="assets/img/hero-neo1.png"><source src="assets/video/Neo1_final.mp4" type="video/mp4"></video><p class="label label">Neo One</p></div></div></div></section>
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
 "software.html":("SDS : Speaker Design Suite — MW Acoustics",software,"software.html"),"videos.html":("Videos — MW Acoustics",videos,"videos.html"),"contact.html":("Contact — MW Acoustics",contact,"contact.html"),"privacy.html":("Privacy Policy — MW Acoustics",privacy,None)}
for fn,(t,b,cur) in pages.items(): (SITE/fn).write_text(shell(t,b,cur)); print("built",fn)
