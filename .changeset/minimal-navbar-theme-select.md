---
'@holocron.so/vite': minor
---

Make the top navbar more minimal. Header links use regular `text-sm` text with more spacing, and `navbar.primary` renders as a filled rounded pill. A `type: "button"` or `type: "link"` primary CTA no longer gets an automatic external-link icon; set `icon` explicitly if you want one.

The light/dark toggle moved from the navbar to the footer as a native select with **System**, **Light**, and **Dark** options. Choosing System stores `color-theme=system` and follows the OS preference live. The `d` keyboard shortcut still flips between light and dark.
