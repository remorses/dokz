---
'@holocron.so/vite': patch
---

Generated OpenAPI, MCP and changelog pages are now valid MDX for any spec text. Text like `{"lease":"studio:42"}`, `<id>` or a stray ``` in a description or example can no longer break a page.

- Endpoint, MCP tool and MCP resource descriptions are now escaped Markdown inside the page, not a JSON prop. They show up in the page's `.md` export and render through the normal page pipeline.
- Code fences in request and response examples are longer than any backtick run inside them.
- Raw HTML blocks in spec Markdown stay separate paragraphs instead of joining the text around them.
- OpenAPI `x-holocron.content` (and `x-mint.content`) is now page content placed before the endpoint, not a child of it.
