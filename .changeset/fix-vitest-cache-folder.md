---
'@holocron.so/vite': patch
---

Running vitest in a project that uses `holocron()` no longer creates a `dummy-non-existing-folder/` with Holocron cache files. Dev and test servers now keep the cache in Vite's cache folder (`node_modules/.vite/holocron`). Builds still cache in `dist/`.
