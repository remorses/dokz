---
'@holocron.so/vite': patch
---

Faster page renders and hydration. The sidebar search index is now built on the first search query instead of on every render. Before, every server render rebuilt it, which was about 30% of server CPU per page on a large docs site. The browser also rebuilt it on hydration and on every client navigation.
