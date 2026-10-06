---
'@holocron.so/vite': minor
---

`VideoBackgroundShader` replaces the fluid simulation with a hover lens. The lens follows the pointer smoothly, magnifies the video under it, lifts dark cells, and sends rings outward. It stays while the pointer rests, and it works on bright and dark parts of the video, also under content placed on top of the shader.

The `fluidCurl`, `fluidVelocityDissipation`, `fluidDyeDissipation`, `fluidSplatRadius`, `fluidPressureIterations` and `fluidStrength` props are removed. Use the new `hoverRadius` prop (CSS pixels, default 160, `0` disables it):

```mdx
<VideoBackgroundShader src="/hero-bg.mp4" hoverRadius={200} />
```
