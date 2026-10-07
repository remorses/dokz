---
'@holocron.so/vite': minor
---

OpenAPI pages now read more of the spec:

- **Server variables** are filled with their defaults, so `{scheme}://{host}:{port}` gives a working cURL URL.
- **Optional auth**: `security: [{}, ...]` shows an "optional" badge instead of a required field. cURL sends the first non-empty requirement, with `apiKey` in its real header, query param or cookie, and `-u` for basic auth. The broken "Token in: header" text is gone.
- **Schema keys** kept for rendering: `examples`, `const`, `exclusiveMinimum`/`exclusiveMaximum` (shown as `> 0`), `readOnly`/`writeOnly`, `minItems`/`maxItems`. cURL and fields read the 3.1 `examples` array.
- **`x-enumDescriptions`** (map) and `x-enum-descriptions` (list) show one line per enum value.
- **Overview page**: in a tab without authored pages, `info.description` becomes an Overview page at `<base>/overview`.
- **Mintlify tag labels**: `x-group`, then the OpenAPI 3.2 tag `summary`, then `x-displayName`, else the tag name exactly as written. Before, untagged-description tags were title-cased (`users` showed as "Users"); set `x-group` to keep a custom label.
- **Mintlify visibility**: `x-hidden: true` keeps the page out of the sidebar, `x-excluded: true` skips the page.
- **Mintlify parameter pills**: `x-mint.pre` / `x-mint.post` on a schema show labels around the field name.
- **Descriptions are plain Markdown**: OpenAPI and MCP descriptions no longer go through the MDX parser, so `{lease}` and `<token>` in prose stay as text instead of vanishing or failing. Raw HTML in descriptions shows as text.
- **Auth with several schemes**: schemes sent together (`[{ key: [], secret: [] }]`) are each marked required.
- **Primitive response bodies** (`const`, `enum`, plain `type`) render instead of being hidden.
