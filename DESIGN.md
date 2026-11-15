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
One authored moment: the Dar es Salaam skyline photo settles in once on load. Section headings reveal once on scroll. Buttons press to 0.97 scale in 160ms. Hover effects only on mouse devices. With "reduce motion" switched on, only gentle fades remain. Nothing loops.

## Signature
The **Next TRA deadlines** panel in the hero calculates the next four statutory deadlines from today's date (PAYE/SDL/withholding tax on the 7th, VAT on the 20th, quarterly provisional tax, final return).

## Figma
Design system and hero concept: https://www.figma.com/design/939ILf8PeI8hNqPRxF05oK
