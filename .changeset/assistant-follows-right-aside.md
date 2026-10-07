---
'@holocron.so/vite': minor
---

Ask AI now goes where the page has room. Pages with a right aside show the Ask AI widget at the top of it. Pages without one (`compact` mode) show the floating bottom pill. On a compact site, OpenAPI and MCP pages keep their right aside, so they now show the widget there instead of a lone "Copy page as Markdown" button next to a floating pill.

**Breaking:** `assistant.display` is removed from `docs.json`. The placement comes from the page layout, so delete the field if you set it.
