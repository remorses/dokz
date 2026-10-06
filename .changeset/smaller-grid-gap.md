---
'@holocron.so/vite': minor
---

Reduce the default column gap between the sidebar and content from `60px` to `40px`. The content column grows by the same amount (620px to 660px with default geometry), and compact pages get a 930px frame instead of 910px. Set `layout.columnGap: 60` in `docs.json` to keep the old spacing.

The unused responsive `--grid-gap` rules in the base stylesheet were removed; the gap always comes from `layout.columnGap` or page frontmatter `gridGap`.
