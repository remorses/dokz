---
'@holocron.so/vite': patch
'@holocron.so/cli': patch
---

Holocron now runs on React 19.3 and Vite 8.3. Update `react`, `react-dom` and `vite` in your docs project:

```bash
pnpm add react@^19.3.0 react-dom@^19.3.0 vite@^8.3.4
```

`holocron create` scaffolds new projects with these versions. Error pages no longer leak secrets like API keys or tokens in stack traces, and an open tab that navigates after a new deploy reloads to the new assets instead of crashing with `client reference not found`.
