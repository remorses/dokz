---
'@holocron.so/vite': patch
---

Fix bash code highlighting splitting words that start with a keyword. `done` was colored as `do` + `ne`, and words like `dot` or `elsewhere` were partly colored. Keywords now only match as whole words.
