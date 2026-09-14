# Accessibility audit — About LNMIIT Campus

- **Date:** 2026-09-14
- **URL:** `http://localhost:4173/about.html`
- **Viewport:** 1280 × 900
- **Engine:** axe-core 4.11.1

## Verified feature behavior

- The captioned Ethers Club logo has meaningful alternative text.
- Service index rows are full links with discernible names.
- The return action is a named link with visible focus styling.
- Shared brand navigation resolves to `about.html`.
- No nested interactive controls were introduced.

## Reported findings

- Existing footer text and the new About footer link use the established `#748078` on `#f5f1e8` treatment, which does not meet the automated AA contrast threshold at the current small font size.
- Axe reported an `aria-prohibited-attr` issue without returning a target node. The page uses only standard attributes on their applicable elements (`aria-label`, `aria-labelledby`, `aria-hidden`, and `aria-current`). This should be rechecked if the shared navigation or footer is refactored.

The existing footer color treatment was intentionally preserved to keep the About page consistent with the rest of the site.
