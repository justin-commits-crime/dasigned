# Dasigned Design System

**Dasigned** is a digital studio at the intersection of high-end design, interactive storytelling and high-performance commerce engineering. It designs and builds bespoke, narrative-driven Shopify storefronts for forward-thinking brands that refuse to look like an off-the-shelf template — pairing editorial art direction with Shopify's infrastructure to connect brand experience with commercial growth.

Surfaces represented here:

- **Dasigned Journal** — the studio's editorial site (Visual & Digital, Technology). Recreated in `ui_kits/journal/`.
- **Client storefronts** — the commerce work. No storefront source was supplied; `ProductCard` is the only commerce primitive and follows the journal's vocabulary.

## Sources

All provided as uploads (no Figma, no codebase):

- `uploads/Screenshot 2026-10-01 at 2.49.23 am.png` — Dasigned Journal homepage. **Primary source of truth.**
- `uploads/dasigned-logo.png` — white wordmark (on a baked-in checkerboard; extracted to transparent PNG).
- `uploads/DA.png` — D/A monogram, white on charcoal.
- `uploads/Screenshot 2026-09-05 at 10.01.01 pm.png` — REKKI site; **moodboard reference only** (tiled paper cards, giant vertical type, blue circle CTA). Not Dasigned's own UI.
- `uploads/11062b_*~mv2.avif` ×4 — official social icons (Facebook, TikTok, Instagram, X).
- `uploads/Screenshot 2026-09-27 at 7.14.25 pm.png` — Arooth agency site; **adopted for the studio site** (pill nav bar, blue pill CTA with white arrow-circle, faint grid lines, giant blue display type).
- Brief notes: "White, black, greys, blue, accent colors. Professional but friendly tone."

---

## CONTENT FUNDAMENTALS

**Voice:** professional but friendly — a confident studio that knows craft and commerce, speaking plainly. Curious, editorial, never salesy-loud.

- **Person:** "we" for the studio, "you" for the reader/client. *"We design and build bespoke storefronts."* / *"Tell us about your brand."*
- **Casing:** Sentence case for headlines and buttons (*"The vitrine and the room"*, *"Start a project"*). Title case only for proper nouns and category names (*"Visual & Digital"*, *"Studios & Designers"*). UPPERCASE is reserved for wide-tracked eyebrows/labels (LATEST, FEATURED, TECHNOLOGY, SEPTEMBER 2026).
- **Headlines:** journalistic — a hook, often a question or a colon construction. *"Meta's Muse Charm: Can Personality Driven AI Make Tech More Engaging"*. Short poetic headlines are also welcome: *"The vitrine and the room"*.
- **The slash:** the logo's slashed A becomes a verbal device — *DESIGNED / DIFFERENTLY*. Use sparingly as a lockup: light word / bold word.
- **Dates:** Month + year, spelled out (*September 2026*). No day unless needed.
- **Numbers & prices:** set in mono; currency symbol, two decimals (*£129.00*).
- **Ampersand** "&" in category names, not "and".
- **Emoji:** never. **Exclamation marks:** almost never.
- **CTAs:** 1–4 words, verb-first: *Start a project · Read more · Shop the story · View all*.

## VISUAL FOUNDATIONS

- **Colour:** overwhelmingly white + ink (#111113). Greys are warm-neutral (`--grey-*`). **Blue #0A47FF** is the single brand hue — category labels, link hover, selection, focus, accent CTAs. Accents (orange, vermilion, sun, moss) are pulled from product photography and used sparingly for badges/status or campaign moments, never as page backgrounds in the journal. No gradients.
- **Type:** a neo-grotesk for everything (Instrument Sans as substitute), Medium weight for headlines with negative tracking, Regular for body and nav. Eyebrows and labels in an **expanded** grotesk (Archivo @ 125% width), uppercase, 0.18em tracking. Mono (IBM Plex Mono) for prices/specs.
- **Layout:** generous 48px outer gutter, wordmark header with lots of air (≈124px tall), no inline nav links — search + hamburger only. Content in asymmetric columns (Latest 1.4fr / Featured 1fr, 58px gap; 26px card gap). Equal-width category bar.
- **Rules as structure:** a **2px ink rule** opens every section (under LATEST/FEATURED, above the category bar); **1px grey-200 hairlines** divide items. Rules do the work boxes would do elsewhere.
- **Cards:** no card chrome at all — square-cornered image, then eyebrow, then headline. No border, no shadow, no radius.
- **Imagery:** warm, natural-light product and interior photography on plain, tonal backdrops (concrete, stone, cream); occasional dark studio shots with fine technical callouts. Colourful objects (orange, red, blue) pop against neutral sets. Always full-bleed within its frame, `object-fit: cover`, square corners. No grain, no duotone.
- **Studio-site direction (from Arooth reference, adopted):** floating **PillNav** (grey-50 capsule holding a logo capsule, link capsule with blue-100 active pill, blue CTA); **arrow CTAs** — pill buttons ending in a circular ↗ chip that rotates 45° on hover; **faint blue construction grid** (`--bg-grid`, 12% blue hairlines in quarters) behind giant blue display type. Journal pages stay ink/rules; studio/marketing pages use this.
- **Backgrounds:** flat white. Ink for overlays (menu). Paper #FCFBF8 / grey-50 for commerce image wells. No patterns or textures.
- **Corner radii:** imagery & layout 0. Interactive controls are **pill** (buttons, tags, toasts, icon buttons are circles). Inputs 4px. Floating panels (dialog) 10px.
- **Shadows:** almost none. Only floating UI (dialog `shadow-lg`, toast `shadow-md`). Everything else is flat.
- **Transparency & blur:** only the modal overlay (ink @56% + 4px blur). No glassmorphism.
- **Hover:** text/links → blue (#0A47FF); primary buttons ink → blue; secondary outline fills ink; images scale 1.03 slowly (480ms); headlines underline (1.5px, 4px offset).
- **Press:** 1px downward nudge; no shrink, no colour flash.
- **Focus:** 2px white + 2px blue ring.
- **Motion:** ease-out `cubic-bezier(.16,1,.3,1)`, no bounce. 120ms colour, 220ms toggles/menus, 480ms overlays/image zoom, 800ms reveal fades. Calm, editorial.
- **Fixed elements:** none required; header scrolls with page. Overlays (menu/search) are full-screen.

## ICONOGRAPHY

- No proprietary icon set was supplied. The screenshot shows simple, heavy-stroke UI glyphs (search, a 3-bar hamburger, a filled circular down-arrow) and filled-circle social icons.
- **UI icons:** [Lucide](https://lucide.dev) via CDN (`lucide-static@0.460.0`), 2px stroke — closest match. ⚠️ Substitution.
- **Social icons:** Dasigned's own set — `assets/icons/social/{instagram,facebook,x,tiktok}.png`, black filled circles (78px source). Used by `SocialLinks`; invert for dark backgrounds. No Pinterest icon supplied.
- Lucide glyphs render through `<Icon>` as CSS masks so they take `currentColor`. (`<Icon brand>` still reaches Simple Icons for networks outside the supplied set.)
- No emoji, no unicode-as-icon (except the typographic "/" in the tagline lockup).

## Logo

Extracted programmatically from the uploads (never redrawn): `assets/logo/wordmark-black.png` (from the site header), `wordmark-white.png`, `wordmark-{white,black}-hires.png` (from `dasigned-logo.png`), `mark-{white,black}.png` (D/A). Use via `<Logo>` (recolourable).

---

## Index

- `styles.css` — entry; imports `tokens/{fonts,colors,typography,spacing,effects,base}.css`
- `guidelines/` — foundation specimen cards (Colors, Type, Spacing, Brand)
- `assets/logo/`, `assets/imagery/` — logos, journal photography (cropped from the screenshot — low-res, replace with originals)
- `components/` — React primitives (below), each with `.jsx`, `.d.ts`, `.prompt.md`, one card per folder
- `ui_kits/journal/` — interactive journal site (home, category, article, menu, search)
- `thumbnail.html`, `SKILL.md`

## Components

- **brand/** Logo
- **core/** Button, IconButton, Icon, Badge, Tag, Tooltip
- **forms/** Input, Select, Checkbox, Radio, Switch
- **feedback/** Dialog, Toast
- **navigation/** PillNav, SiteHeader, CategoryNav, Tabs
- **editorial/** ArticleCard, Eyebrow, SectionHeader, Tagline, SocialLinks
- **commerce/** ProductCard

No source component library existed, so this is an authored standard set sized to the brand. **Intentional additions** beyond the standard set: Logo (brand mark), Icon (CDN glyph wrapper), CategoryNav / SiteHeader / ArticleCard / Eyebrow / SectionHeader / Tagline / SocialLinks (seen directly in the journal screenshot), ProductCard (the studio's Shopify work).

## Fonts ⚠️

Original brand fonts were not supplied. Substitutes via Google Fonts: **Instrument Sans** (headlines/body), **Archivo** expanded (eyebrows/tagline), **IBM Plex Mono** (prices/specs).
