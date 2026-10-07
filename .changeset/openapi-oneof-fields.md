---
'@holocron.so/vite': patch
---

OpenAPI and MCP field lists now render `oneOf` and `anyOf` schemas. A request or response body that is a union shows its description, then one expandable panel per option (named by its `title`, else `Option N`) with that option's fields. A property whose type is a union of objects gets a "Show options" panel, and its type shows the option titles (`Point | Text`). Before, a union body rendered an empty Request Body section.
