# 07 — Tasarım Konsept Promptu (Claude Design için)

## Nasıl kullanılır

1. Aşağıdaki **"PROMPT"** bölümünü olduğu gibi kopyala, Claude Design'a (ya da Claude'un `design` becerisine, ya da Figma
   Make'e) ver. İngilizce yazıldı çünkü tasarım araçları ve font/renk terimleri İngilizcede daha isabetli çalışır.
2. Çıkan konsepti `resource/design/` altına kaydet (PNG/PDF + varsa kaynak dosya).
3. Beğenmediğin yerleri "Varyasyon istekleri" bölümündeki hazır cümlelerle iste.
4. Konsept oturunca "Token çıkarma promptu"nu ver; çıkan token listesi `web/` Tailwind yapılandırmasına girer.

## Tasarım yönü (özet, Türkçe)

**Metafor: Gözlemevi.** Gece, sessizlik, tek bir ışık çizgisi. Timeline gökyüzünde bir ışık nehri; her olay bir yıldız.
Çağlar takımyıldızlar. Kullanıcı kaydırdıkça yıldızlar yaklaşır. Eski çağlar seyrek ve loş, yakın çağ yoğun ve parlak.

**His**: Hayret, sakinlik, güven. Ders kitabı değil, belgesel. Oyuncak değil, enstrüman.

**Değil**: Neon "uzay oyunu", parlak gradient'ler, dev illüstrasyonlar, bilim ikonları (atom, DNA, roket klişeleri), bulanık cam efektleri.

**Renk düzeni**: İki tema eşit ağırlıkta üretilir (kararın: ikisini de görüp seçeceksin). Karanlık: "gece gözlemevi". Aydınlık: "sabah, gözlem defteri": kırık beyaz kâğıt, koyu mürekkep. Konsept sonrası biri birincil seçilir, diğeri anahtarla kalır.

**Tipografi**: Yıllar ve çağ adları için karakterli bir serif (Cyrillic + `Ңөү` destekli). Metin için temiz bir sans.
Rakamlar tabular. Yıl sayısı sayfanın en büyük tipografik ögesi.

---

## PROMPT

```
You are designing the visual concept for a science-history timeline website named "Uchkun" (Учкун, Kyrgyz for "spark").
The name is final. A wordmark is welcome; a subtle nod to a spark or a single point of light is fine, but no cartoon
spark icon, no flame emoji energy. The wordmark must work in Latin ("Uchkun") and Cyrillic ("Учкун").

## What the product is
A modern, story-driven timeline of how humanity got from Thales (585 BCE) to CRISPR and AI (today). It is for curious
non-scientists, not for experts: people who use technology every day and feel awe (and a little vertigo) at how little of it
they could rebuild themselves. The core emotional promise: "You are falling into time. Every discovery you meet stood on
the shoulders of an earlier one. Watch how slowly it started and how fast it got."

The site runs in four languages with equal status: English, Russian, Kyrgyz, Turkish. Two of them use Cyrillic; Kyrgyz
additionally needs the letters Ң ң Ө ө Ү ү. Every typeface you propose must contain these glyphs. Russian and Kyrgyz
strings run ~30% longer than English; design buttons and chips for the longest case.

## Creative direction
Metaphor: an observatory at night. Silence, a single line of light, stars that get denser as you approach the present.
The timeline is a river of light; each event is a star on it; eras are constellations. Ancient eras feel sparse and dim;
the 20th century feels dense and bright. Feeling: awe, calm, trust. Documentary, not textbook. Instrument, not toy.

Avoid: neon "space game" aesthetics, loud gradients, glassmorphism blur, stock science icons (atoms, DNA helices, rockets,
lightbulbs), illustrated mascots, decorative particles that move constantly. Restraint is the brand.

Design two themes with equal care; the client will choose the primary one after seeing both. Dark: "night at the
observatory". Light: "morning, the observer's notebook": off-white paper, near-black ink, the same accent system.
Both themes must pass WCAG AA (4.5:1) for body text; aim AAA (7:1) on the dark theme.

## Typography
- Display serif for years, era names, event titles: characterful, slightly editorial, with Cyrillic support and the Kyrgyz
  letters. Candidates to evaluate: Playfair Display, Cormorant Garamond, Lora, Literata, Source Serif 4. Show the year
  "1687", "MÖ 585", "б.з.ч. 585", "Ңөү" in the chosen face.
- Body sans with tabular figures and full Cyrillic: Inter, Manrope, Golos Text, or Noto Sans. Show a Kyrgyz paragraph.
- Scale: the year is the largest typographic element on any screen; it is the wayfinding device.
- Numbers always tabular (font-variant-numeric: tabular-nums) so a live year counter does not jitter.

## Color system
- Backgrounds: deep blue-black ink (not pure black), two elevation steps.
- One warm accent (candle / brass / old gold) for the timeline line, focus rings and primary buttons.
- Eight discipline colors, muted and distinguishable on both themes, each with a name: mathematics (violet), physics (blue),
  astronomy (indigo), chemistry (orange), biology (green), medicine (coral), earth & climate (ochre/earth), technology
  (steel gray). Show all eight as small chips with a colored dot plus a label, side by side, in both themes.
- Text: three levels (primary, secondary, muted). No pure white on dark.

## Screens to design (mobile 390px first, then desktop 1440px)
1. Landing / entry. Almost empty. One line: "How did we get here?" and a primary button "Fall into time". Below the fold,
   a faint, real-scale strip of the whole timeline with tiny dots (sparse on the left, dense on the right) as a teaser.
2. The timeline (the core screen). Vertical flow of event cards on a single luminous line. Show:
   - a fixed top bar with menu, a large live year "1687", and a language switcher (EN · RU · KY · TR);
   - a sticky era header ("Scientific Revolution 1400–1700") that changes as you scroll;
   - three event cards of different importance: a landmark card (large, with image), a standard card, and a minor
     one-line note;
   - a "time gap" marker between two events: a dotted stretch of the line with the text "~340 years passed" and a one-line
     note about why;
   - the minimap: a thin real-scale strip (bottom on mobile, right edge on desktop) with dots and a cursor showing where
     the user is in 2,600 years;
   - discipline filter chips; unselected chips are dimmed, not hidden.
3. Event detail, opened as a side panel on desktop and a full-height sheet on mobile, timeline still visible behind.
   Sections: year + precision label ("c. 300 BCE"), title, summary, one image with credit line, body text, a highlighted
   box "Why it matters", a second small box "If you were there…", discipline chips, people, "Builds on" and "Made possible"
   link lists, sources, and a prominent button "How did we get here?".
4. "Explore" mode: a real-scale, zoomable canvas of all 2,600 years. Horizontal axis is time at true scale; eight
   horizontal discipline lanes in their colors. Show three zoom levels side by side: (a) zoomed all the way out, where
   the eight eras appear as blocks and only landmark events are dots with tiny labels, and the left two-thirds of the
   canvas is nearly empty while the right edge is dense; (b) zoomed to one century (1600–1700) with small cards
   appearing in lanes; (c) zoomed to a decade (1665–1675) with full cards, people shown as lifespan bars, and thin
   curved "builds on" connectors between events. A fixed year ruler on top; a "Back to flow" button; zoom controls.
   Mobile: the zoomed-out state with a hint "pinch to zoom".
5. "How did we get here?" chain view: the selected event at top, then its prerequisites flowing backwards level by level
   like a river delta in reverse, years on the left, small cards, curved connectors. Up to six levels. Mobile: accordion.
6. Era chapter page: full-bleed quiet header with the era name, date range, a two-sentence thesis, then the events of the era.
7. Admin event editor (utility, not brand): a clean form with year, precision, importance, title, summary, body (markdown),
   why it matters, if you were there, disciplines, people, links, sources, image with mandatory credit, status
   draft/published; plus a side-by-side four-language translation view with a "Translate with AI" button and
   "machine / reviewed" status badges. Also a "Review queue" screen: a list of AI-drafted events awaiting approval, each
   with a research note and source links, and three actions: Publish, Edit, Reject. The admin UI itself is localized
   into the same four languages. Keep it plain, fast, keyboard-friendly.
8. States: loading skeleton for the timeline, "not yet translated into Kyrgyz" badge on a card, "auto-translated" badge,
   empty filter result, image-less event card (discipline color with the year set large as the visual).
9. The "honesty band": a small, warm, persistent note in the footer of every page (and once on the landing page):
   "The person who built this site is not a historian or a scientist. If you spot a mistake, please tell us; we will be
   glad to fix it." with a "Report an error" link. Design it as a signature, not a disclaimer: humble, human, readable.

## Motion (describe, do not overdo)
- Entry: pressing "Fall into time" dims the screen, the year counter spins backwards from 2026 to 585 BCE in ~1.5s,
  decelerates, and the first event fades in. Provide a reduced-motion variant (simple fade).
- Scrolling: the year counter ticks like an odometer; the era name briefly appears in the top bar on change.
- Everything else is still. No perpetual particle fields.

## Deliverables
- Mood/direction board (1 board): typography, palette, three reference images or sketches, one paragraph of rationale.
- The nine screens above, mobile and desktop. Timeline, event detail, explore mode and landing in BOTH themes; the rest in dark.
- A component sheet: buttons (primary, secondary, ghost), chips, badges, cards (3 importance sizes), the time-gap marker,
  the minimap, the year display, the language switcher, form fields.
- Design tokens as a list: color names + hex for both themes, type scale (px/rem + line heights), spacing scale, radius,
  shadows, motion durations/easings.
- Show the same event card in all four languages (use these strings):
  EN: 1687 — Newton publishes the Principia — The fall of an apple and the orbit of the Moon obey one law. Sky and earth
      become one physics.
  RU: 1687 — Ньютон публикует «Начала» — Падение яблока и движение Луны подчиняются одному закону. Небо и земля стали
      одной физикой.
  KY: 1687 — Ньютон «Башталыштарды» жарыялады — Алманын кулашы жана Айдын айлануусу бир эле мыйзамга баш ийет.
      Асман менен жер бир физика болду.
  TR: 1687 — Newton "Principia"yı yayımladı — Elmanın düşmesi ile Ay'ın dönmesi aynı yasaya uyar. Gök ve yer tek fizik oldu.
```

---

## Varyasyon istekleri (hazır cümleler)

- "Make the dark background one step warmer (toward ink-brown) and show the timeline screen again."
- "The accent reads too orange; try a paler brass and re-render the buttons and the timeline line."
- "The landmark card is too heavy; reduce image height by a third and let the year dominate."
- "Show the minimap on desktop as a vertical strip on the right instead of the bottom."
- "Propose two alternative display serifs and set the Kyrgyz sample in each."
- "Design the time-gap marker three ways: dotted line, compressed ruler ticks, and a small text-only note."
- "Give me a light-theme version of the chain view."
- "In explore mode the lanes feel like a spreadsheet; soften the lane boundaries and try lanes as faint bands of color."
- "Show the wordmark 'Uchkun / Учкун' in three treatments: pure type, type with a single point of light, type with a thin horizontal line."

## Token çıkarma promptu

Konsept onaylanınca:

```
Extract the final design system as a JSON object suitable for Tailwind CSS v4 theme configuration:
{ colors: { dark: {...}, light: {...}, disciplines: {...} }, fontFamily, fontSize (with lineHeight), spacing, borderRadius,
boxShadow, transitionDuration, transitionTimingFunction }. Use semantic names (bg-base, bg-elevated, text-primary,
accent, line, discipline-physics ...), not raw color names. Include a short usage note per token.
```

## Nereye kaydedilir

- `resource/design/01-moodboard.*`
- `resource/design/02-screens-dark/`, `03-screens-light/`
- `resource/design/04-components.*`
- `resource/design/tokens.json` → `web/app/globals.css` içindeki `@theme` bloğuna aktarılır.
- Font lisansları `resource/fonts/LICENSES.md` (Google Fonts, OFL).
