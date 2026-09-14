# Accessibility audit — Mess Menu

- **Date:** 2026-09-14
- **URL:** `http://localhost:4173/mess-menu.html`
- **Viewport:** 390 × 844
- **Engine:** axe-core 4.11.1

## Feature checks

The today-first menu and weekly-menu toggle passed the relevant checks:

- The weekly menu control has a discernible button name.
- `aria-expanded` updates between `false` and `true`.
- `aria-controls="weeklyMenu"` points to the controlled panel.
- The toggle is keyboard operable.
- No nested interactive controls were introduced.

## Existing contrast findings

The audit reported three existing contrast issues outside the new interaction:

- `.section-kicker` uses `#6e7a71` on `#f5f1e8` at 11px.
- Footer text uses `#748078` on `#f5f1e8` at 8px.

These were not changed because they are part of the existing site-wide visual treatment and are unrelated to the requested Mess Menu behavior.
