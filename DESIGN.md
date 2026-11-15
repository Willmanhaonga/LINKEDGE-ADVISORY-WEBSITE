# LinkEdge Advisory — Design notes

**Feel:** bold and premium. Deep navy from the logo carries the page; one light-blue accent marks actions and focus.

## Colours
| Role | Hex |
|---|---|
| Ink (footer, contact) | `#050E24` |
| Navy (logo, main ground) | `#011B51` |
| Navy raised (panels on navy) | `#0B2A6B` |
| Sky (logo accent, buttons, focus) | `#0095EC` |
| Sky text on light | `#0071B8` |
| Soft blue text on navy | `#A9C1E4` |
| Paper (light ground) | `#F5F7FA` |
| Body text | `#0F1A33` |
| Secondary text | `#4A5875` |

## Type
- **Zilla Slab** 600/700: headings (matches the slab lettering of the logo)
- **Geist**: body text
- **Geist Mono**: dates and figures only
All fonts are self-hosted in `assets/fonts` (SIL Open Font License).

## Motion
Hero slideshow: four Dar es Salaam photos, 4 seconds each, 1.6s crossfade with a slow linear zoom. Progress bars to jump between photos and a pause button; pauses when the tab is hidden or the hero is scrolled away. With reduced motion: no zoom, short fade. Section headings reveal once on scroll. Buttons press to 0.97 scale in 160ms. Hover effects only on mouse devices. With "reduce motion" switched on, only gentle fades remain. Nothing loops.

## Signature
The **Next TRA deadlines** panel in the hero calculates the next four statutory deadlines from today's date (PAYE/SDL/withholding tax on the 7th, VAT on the 20th, quarterly provisional tax, final return).

## Figma
Design system and hero concept: https://www.figma.com/design/939ILf8PeI8hNqPRxF05oK

## Scroll entrances (3D)
Each content type enters once as it scrolls into view, with its own motion: service rows and deadline cells tilt up from below; the outer package cards swing in like doors while the middle one rises; "Who we work with" rows swing from alternating sides; team portraits turn toward the visitor in sequence; steps rise in order; the form tilts up. 900ms strong ease-out, transform and opacity only. Reduced motion: fade only.

## Also on the page
- 3D logo above the headline: the chain mark extruded in layers, spinning constantly (one turn every 2s, owner request) and leaning toward the mouse on computers. Pauses off screen or in hidden tabs; still with reduced motion.
- Hover tilt on package cards and team photos (mouse devices only).
- Deadline counters count up once when the calendar appears.
- Stronger 3D scroll entrances on computers; lighter versions on phones.
- FAQ section (native accordion), opening hours, Google map of the office (loads only on the live site).
- Visitor statistics: GoatCounter (no cookies). Account code: linkedgeadvisory.
