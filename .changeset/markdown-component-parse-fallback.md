---
'@holocron.so/vite': patch
---

`<Markdown>` no longer crashes the page when its text is not valid MDX (for example `{"lease":"studio:42"}`, which is not a JS expression). It logs a warning and shows the raw text instead of returning a 500.
