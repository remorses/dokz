---
'@holocron.so/vite': patch
---

Faster page renders. The cached MDX tree is no longer deep-copied with `structuredClone` on every request; all requests now share one tree. On a long page (a 63k character README) the copy was about 14% of server CPU per request. Rendering no longer changes the cached tree: heading demotion and heading ids run once when the markdown is parsed, and the page chrome is added to a copy of the `<Aside>`. In dev and tests the cached tree is frozen, so a mutation throws instead of corrupting later requests.
