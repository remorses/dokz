---
'@holocron.so/vite': minor
---

OpenAPI tabs now serve their spec as formatted JSON under the tab base path (`/api/openapi.json`; `openapi-<name>.json` when a tab has several specs). Endpoint pages show "Copy OpenAPI schema URL" instead of "Copy page as Markdown". The spec is also in `docs.zip` and `llms.txt`, so the AI assistant can read it. Custom `virtual:holocron-mdx` modules must now export `getStaticFiles()`.
