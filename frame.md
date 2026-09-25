# Qibla Line explainer: design spec

Source of truth: the app's own `~/Dev/personal/qibla-line/DESIGN.md` (tokens chosen 2026-09-25). Video sizes are scaled up from the app; colours and fonts are not changed.

## Palette

| Role | Hex | Use |
|---|---|---|
| night | `#07090c` | background of every scene |
| panel | `#12161c` | phone body, cards, dial face |
| rule | `#2a3038` | faint structure: floor grid, globe graticule |
| ink | `#d8d2c4` | text, room outlines (at 55–80% opacity) |
| dim | `#7c7f84` | secondary text, labels, distant outlines |
| amber | `#ffb23e` | the Qibla line, the Kaaba mark, the "facing" state. Nothing else. |

Amber is the film's one accent and its spine: it appears only where the Qibla is.

## Type

- Display: Chivo 700, 72–96px, line-height 1.1
- Body: Chivo 400, 32–40px
- Labels and numbers: Chivo Mono 500, 22–28px
- Files: `assets/fonts/` (the same Fontsource files the app bundles)

## Drawing style

The room and the world are outline drawings: 2px lines in ink at 55–80% opacity, no fills except the night background, like an architect's axonometric. The phone is the one solid object (panel body, real app screenshot on its screen).

## Motion

Ease `power3.out` for arrivals, `power2.inOut` for camera moves, `expo.out` for the line's flight. One continuous world: the camera moves between scenes rather than cutting where it can.

## Do not

- No drawn imitation of the app's UI: phone screens are real screenshots.
- No people or hands; the camera is the viewer.
- No glow blobs or gradients beyond the Qibla line's own soft halo.
- No emoji, stock icons or gradient text.
- No em dashes in on-screen copy.
