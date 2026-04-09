# Design Brief: KLU Spotter

**Tone:** Institutional boldness meets tech precision. Campus efficiency tool that commands attention without playfulness. Confident, authoritative, high-legibility.

**Differentiation:** Entry animation dominates—KLU red rectangles slide outward, centered white bar holds attention, burst popup "roars" for login. Post-login is clean institutional data grid with zero friction.

## Palette

| Token | OKLCH | Purpose |
|-------|-------|---------|
| Primary (KLU Red) | `0.52 0.23 25` | Institutional authority, buttons, occupied rooms |
| Accent (Success Green) | `0.75 0.25 142` | Empty rooms, positive states, highlight |
| Background (Light) | `0.98 0 0` | Dashboard, entry screen |
| Card (Dark) | `0.15 0 0` (dark mode) | Room grid cards for contrast |
| Foreground | `0.95 0 0` (dark mode text) | Text on dark surfaces |
| Border | `0.88 0 0` (light) / `0.25 0 0` (dark) | Card separation |

## Typography

| Tier | Font | Usage |
|------|------|-------|
| Display | Bricolage Grotesque | Headings, hero text, room numbers (bold, geometric) |
| Body | DM Sans | Copy, labels, navigation, feedback |
| Mono | JetBrains Mono | Timestamps, session codes, data fields |

**Type Scale:** 48px (H1, room number) / 32px (H2) / 20px (H3) / 16px (body) / 14px (caption)

## Shape Language

- Border radius: 8px (`.rounded-lg`) for modern precision, no soft curves
- Cards: Elevated with `shadow-md` and `border border-border`
- No rounded corners on entry rectangles (sharp edges convey authority)

## Structural Zones

| Zone | Treatment | Behavior |
|------|-----------|----------|
| Header | `bg-background` or `bg-popover`, `border-b border-border` | Logo, title, semester/cluster filters |
| Entry Screen | Full-bleed KLU red edges, white center bar | Burst popup on interaction |
| Room Grid | `bg-background dark:bg-card` cards in rows, organized by block | Staggered entry, hover elevation |
| Status Indicator | Green (EMPTY) or Red (OCCUPIED) text + icon | High-contrast, no ambiguity |
| Footer | `bg-muted/30`, `border-t border-border` | Session info, timestamp |

## Component Patterns

- **Buttons:** `bg-primary text-primary-foreground` for primary actions, `border border-border` for secondary
- **Room Card:** `bg-card dark:bg-card text-foreground`, `shadow-md`, corner-aligned room number in `text-accent` or `text-destructive`
- **Popup:** Burst scale animation (framer-motion), `bg-popover` with strong shadow, no border radius on outer edge for "roar" effect
- **Toast:** Sonner notifications for validation errors, semester mismatches, cluster warnings

## Motion & Animation

| Animation | Purpose | Timing |
|-----------|---------|--------|
| Slide Left / Right | KLU red rectangles exit on login click | 0.6s ease-out |
| Burst Pop | Popup scales from 0.2 to 1.0, opacity fade-in | 0.5s cubic-bezier |
| Fade In | Room grid stagger entry, nav fade | 0.3s ease-out |
| Hover Elevation | Card `shadow-md` → `shadow-lg` on hover | 0.2s smooth |

## Constraints

- **Color literals:** Never use hex/rgb—always `oklch(var(--{token}))`
- **Fonts:** Bricolage Grotesque for display, DM Sans for body (loaded via @font-face)
- **Contrast:** AA+ on all text (foreground L=0.95 on card L=0.15 passes WCAG AAA)
- **Animation:** Framer-motion only (no CSS keyframes for entry logic), no bounce/playful easing on data grid
- **Grid:** Mobile-first, 1 column (sm), 2 columns (md), 3+ columns (lg)

## Dark Mode

Always active. Backgrounds are near-black (`L0.12`), text is near-white (`L0.95`). Primary accent elevated to `L0.65` for visibility on dark surfaces. No light mode variant needed.

## Signature Detail

**The Roar Effect:** Entry popup has no top border-radius on initial render—appears as burst emerging from behind the rectangles. On animation completion, subtle `rounded-lg` is applied, softening the impact. This transition reinforces the "roar" metaphor: aggressive entry, controlled landing.
