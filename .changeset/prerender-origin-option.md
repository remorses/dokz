---
'@holocron.so/vite': minor
---

**New `prerenderOrigin` option for `rendering: static` pages.** Absolute URLs in a prerendered page (`og:url`, the OG image label) come from the single host in the Worker `routes`. When routes list several hosts, like the apex and `www`, the build used the local preview origin and shipped `og:url` as `http://localhost:…`. Pass the public origin instead:

```ts
holocron({ prerenderOrigin: 'https://example.com' })
```
