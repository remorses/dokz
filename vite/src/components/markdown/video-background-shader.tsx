'use client'

/**
 * VideoBackgroundShader — full-screen video background rendered through a
 * dot-grid (or ASCII) shader with an interactive hover lens.
 *
 * Uses raw WebGL (zero runtime dependencies). Video luminance drives dot
 * radius: bright = big dot, dark = invisible (unless minLuminance is set).
 * The pointer carries a smoothed lens: it magnifies the video, lifts dark
 * cells, and emits rings that travel outward. The lens stays while the
 * pointer rests, so the effect is the same on dark and bright video parts.
 *
 * Usage in MDX:
 *   <VideoBackgroundShader src="/hero-bg.mp4" dotColor="#8da4ff" dotSize={6}>
 *     # My heading
 *   </VideoBackgroundShader>
 */

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '../../lib/css-vars.ts'

// ─── WebGL typed helpers ───────────────────────────────────────────────────
//
// Minimal utilities for shader-only 2D effects: program compilation with
// cached uniform locations and a full-screen quad. All programs share fixed attribute locations
// (0 = position, 1 = uv) so the quad only needs binding once.

interface GpuProgram {
  program: WebGLProgram
  /** Get a cached uniform location by name. Throws if not found. */
  loc(name: string): WebGLUniformLocation
  dispose(gl: WebGLRenderingContext): void
}

interface QuadBuffers {
  positionBuffer: WebGLBuffer
  uvBuffer: WebGLBuffer
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
  // createShader returns null when the context is lost or the GPU is unavailable
  // (common on older iOS under memory pressure / low power mode). Passing null to
  // shaderSource throws Safari's "must be an instance of WebGLShader" TypeError,
  // so fail with a controlled error the component can catch instead.
  const shader = gl.createShader(type)
  if (!shader) throw new Error('WebGL unavailable: createShader returned null (context lost?)')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader)
    gl.deleteShader(shader)
    throw new Error(`Shader compile: ${info}`)
  }
  return shader
}

function createGpuProgram(gl: WebGLRenderingContext, vertSrc: string, fragSrc: string): GpuProgram {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vertSrc)
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fragSrc)
  const program = gl.createProgram()
  if (!program) throw new Error('WebGL unavailable: createProgram returned null (context lost?)')
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  // Fixed attribute locations so quad binding is program-independent
  gl.bindAttribLocation(program, 0, 'position')
  gl.bindAttribLocation(program, 1, 'uv')
  gl.linkProgram(program)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program)
    gl.deleteProgram(program)
    throw new Error(`Program link: ${info}`)
  }
  const uniforms = new Map<string, WebGLUniformLocation>()
  const count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS) as number
  for (let i = 0; i < count; i++) {
    const info = gl.getActiveUniform(program, i)
    if (!info) continue
    const loc = gl.getUniformLocation(program, info.name)
    if (loc) uniforms.set(info.name, loc)
  }
  return {
    program,
    loc(name) {
      const l = uniforms.get(name)
      if (!l) throw new Error(`Unknown uniform: ${name}`)
      return l
    },
    dispose(gl) {
      gl.deleteProgram(program)
    },
  }
}

function createQuadBuffers(gl: WebGLRenderingContext): QuadBuffers {
  const positions = new Float32Array([-1, -1, 0, 1, -1, 0, -1, 1, 0, 1, 1, 0])
  const uvs = new Float32Array([0, 0, 1, 0, 0, 1, 1, 1])
  const positionBuffer = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW)
  const uvBuffer = gl.createBuffer()!
  gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer)
  gl.bufferData(gl.ARRAY_BUFFER, uvs, gl.STATIC_DRAW)
  return { positionBuffer, uvBuffer }
}

/** Bind quad vertex attributes to locations 0 (position) and 1 (uv). Call once at init. */
function bindQuad(gl: WebGLRenderingContext, quad: QuadBuffers) {
  gl.bindBuffer(gl.ARRAY_BUFFER, quad.positionBuffer)
  gl.enableVertexAttribArray(0)
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0)
  gl.bindBuffer(gl.ARRAY_BUFFER, quad.uvBuffer)
  gl.enableVertexAttribArray(1)
  gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 0, 0)
}

/** Bind a texture to a unit and set the corresponding sampler uniform. */
function setTexture(gl: WebGLRenderingContext, prog: GpuProgram, name: string, texture: WebGLTexture, unit: number) {
  gl.activeTexture(gl.TEXTURE0 + unit)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.uniform1i(prog.loc(name), unit)
}

/** Draw the bound quad to the screen. */
function drawToScreen(gl: WebGLRenderingContext) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight)
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
}

/** Create a 1x1 transparent placeholder texture. */
function createEmptyTexture(gl: WebGLRenderingContext): WebGLTexture {
  const tex = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, tex)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]))
  return tex
}

// ─── Shader sources ────────────────────────────────────────────────────────

const BASE_VERTEX = /* glsl */ `
  precision highp float;
  attribute vec3 position;
  attribute vec2 uv;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`

const DISPLAY_FRAG = /* glsl */ `
  precision highp float;
  uniform sampler2D uVideo;
  uniform sampler2D uMask;
  uniform bool enableMask;
  uniform vec2 pointer;
  uniform float pointerStrength;
  uniform float hoverRadius;
  uniform float gridCellSize;
  uniform float dotRadius;
  uniform float minDotRadius;
  uniform vec2 videoResolution;
  uniform float time;
  uniform float animSpeed;
  uniform float gamma;
  uniform int gridLayout;
  uniform vec3 dotColor;
  uniform float dotAlphaMultiplier;
  uniform bool dotsEnabled;
  uniform float minLuminance;
  uniform int dotStyle;
  uniform sampler2D uCharAtlas;
  uniform float charCount;
  varying vec2 vUv;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
  }

  // Two octaves, range ~0-1. Drifts slowly so the lens edge breathes.
  float organicNoise(vec2 p, float t) {
    float n = valueNoise(p + vec2(t * 0.35, -t * 0.25)) * 0.65;
    n += valueNoise(p * 2.1 + vec2(-t * 0.5, t * 0.4)) * 0.35;
    return n;
  }

  vec4 premultipliedDotColor(float alpha) {
    float a = clamp(alpha, 0.0, 1.0);
    return vec4(dotColor * a, a);
  }

  void main() {
    vec2 gridPos;
    vec2 cellCenter;
    vec2 cellIndex;
    vec2 centerUv;
    float distanceFromCenter;
    float aspectRatio = videoResolution.x / videoResolution.y;

    if (gridLayout == 1) {
      // Radial layout
      vec2 pixelPos = vUv * videoResolution;
      vec2 center = videoResolution * 0.5;
      float minDim = min(videoResolution.x, videoResolution.y);
      vec2 normalizedPos = (pixelPos - center) / minDim;
      float angle = atan(normalizedPos.y, normalizedPos.x);
      float radius = length(normalizedPos) * minDim;
      float ringIndex = floor(radius / gridCellSize);
      vec2 dotCenterNormalized;
      float dotIndex;
      if (ringIndex < 0.5) {
        dotCenterNormalized = vec2(0.0, 0.0);
        dotIndex = 0.0;
      } else {
        float ringRadius = ringIndex * gridCellSize;
        float circumference = 6.28318 * ringRadius;
        float numDotsInRing = max(1.0, floor(circumference / gridCellSize));
        float anglePerDot = 6.28318 / numDotsInRing;
        dotIndex = floor(angle / anglePerDot);
        float dotAngle = (dotIndex + 0.5) * anglePerDot;
        float dotRad = (ringIndex + 0.5) * gridCellSize;
        dotCenterNormalized = vec2(cos(dotAngle), sin(dotAngle)) * (dotRad / minDim);
      }
      vec2 dotCenterPixel = dotCenterNormalized * minDim + center;
      vec2 toDotNormalized = normalizedPos - dotCenterNormalized;
      distanceFromCenter = length(toDotNormalized) * minDim;
      centerUv = dotCenterPixel / videoResolution;
      cellIndex = vec2(ringIndex, dotIndex);
      gridPos = vec2(0.0);
      cellCenter = vec2(0.0);
    } else if (gridLayout == 2) {
      // Alternating grid (brick pattern)
      cellIndex = floor(vUv * videoResolution / gridCellSize);
      float rowOffset = mod(cellIndex.y, 2.0) * gridCellSize * 0.5;
      vec2 offsetPixel = vUv * videoResolution + vec2(rowOffset, 0.0);
      cellIndex = floor(offsetPixel / gridCellSize);
      centerUv = ((cellIndex + 0.5) * gridCellSize - vec2(rowOffset, 0.0)) / videoResolution;
      gridPos = mod(offsetPixel, gridCellSize);
      cellCenter = vec2(gridCellSize * 0.5);
      distanceFromCenter = length(gridPos - cellCenter);
    } else {
      // Straight layout (default)
      gridPos = mod(vUv * videoResolution, gridCellSize);
      cellCenter = vec2(gridCellSize * 0.5);
      cellIndex = floor(vUv * videoResolution / gridCellSize);
      centerUv = ((cellIndex + 0.5) * gridCellSize) / videoResolution;
      distanceFromCenter = length(gridPos - cellCenter);
    }

    // Hover lens, all in pixel space. The distance is warped by drifting
    // noise so the lens is a soft, slowly morphing blob instead of a circle,
    // and the rings it emits wobble with it.
    vec2 cellPx = centerUv * videoResolution;
    vec2 fromPointer = cellPx - pointer;
    float warp = organicNoise(cellPx / (hoverRadius * 0.6), time) - 0.5;
    float pointerDist = max(length(fromPointer) + warp * hoverRadius * 0.9, 0.0);
    float lens = pointerStrength * exp(-(pointerDist * pointerDist) / (hoverRadius * hoverRadius * 0.5));

    // Magnify: cells near the pointer sample video closer to the pointer
    vec2 sampleUv = (pointer + fromPointer * (1.0 - 0.3 * lens)) / videoResolution;
    vec4 video = texture2D(uVideo, sampleUv);
    vec3 videoGammaCorrected = pow(video.rgb, vec3(gamma));
    float luminance = max(dot(videoGammaCorrected, vec3(0.299, 0.587, 0.114)), minLuminance);

    // Lift dark cells so the lens reads as a soft glow on dark video
    luminance = max(luminance, lens * 0.7);
    // Rings travel outward from the pointer. Bright cells show them as
    // darker bands, dark cells as brighter bands, so every area reacts.
    float ripple = sin(pointerDist * 0.12 - time * 4.0);
    luminance *= 1.0 + 0.35 * lens * ripple;

    if (enableMask) {
      vec4 mask = texture2D(uMask, vUv);
      float maskAlpha = mask.a;
      luminance = luminance * maskAlpha;
    }

    luminance = clamp(luminance, 0.0, 1.0);

    if (!dotsEnabled) {
      gl_FragColor = premultipliedDotColor(luminance * dotAlphaMultiplier);
      return;
    }

    // ASCII mode: sample character glyph from a font atlas texture.
    // Characters are ordered by visual weight in the atlas. Luminance picks
    // the base index; per-cell random jitter adds variety so neighboring
    // cells at similar brightness show different characters.
    if (dotStyle == 1) {
      // Per-cell hash that changes over time: each cell shifts character
      // ~3 times/sec with a discrete jump (floor quantizes so it doesn't flicker)
      float r = random(cellIndex + floor(time * 3.0));
      float idx = luminance * (charCount - 1.0) + (r - 0.5) * 5.0;
      idx = clamp(idx, 0.0, charCount - 1.0);
      float ci = floor(idx);
      vec2 cellPos = clamp(gridPos / gridCellSize, vec2(0.01), vec2(0.99));
      vec2 atlasUv = vec2((ci + cellPos.x) / charCount, cellPos.y);
      float charMask = texture2D(uCharAtlas, atlasUv).r;
      float luminanceCutoff = smoothstep(0.0, 0.05, luminance);
      float finalAlpha = charMask * luminance * luminanceCutoff * dotAlphaMultiplier;
      gl_FragColor = premultipliedDotColor(finalAlpha);
      return;
    }

    float randomValue = random(cellIndex);
    float phase = randomValue * 6.28318;
    float scaleAnimation = sin(time * animSpeed + phase) * 0.5 + 0.5;
    float randomScale = 1.0 - (scaleAnimation * 0.5);
    float luminanceMinScale = min(minDotRadius / dotRadius, 1.0);
    float finalScale = (luminanceMinScale + (luminance * (1.0 - luminanceMinScale))) * randomScale;
    float scaledRadiusVal = dotRadius * finalScale;
    float maxRadius = gridCellSize * 0.5;
    scaledRadiusVal = min(scaledRadiusVal, maxRadius);
    float edgeWidth = 0.5;
    float dotMask = 1.0 - smoothstep(scaledRadiusVal - edgeWidth, scaledRadiusVal + edgeWidth, distanceFromCenter);
    float luminanceCutoff = smoothstep(0.0, 0.1, luminance);
    float finalAlpha = dotMask * luminance * luminanceCutoff * dotAlphaMultiplier;

    gl_FragColor = premultipliedDotColor(finalAlpha);
  }
`

// ─── Config ────────────────────────────────────────────────────────────────

export interface VideoShaderConfig {
  /** Video source path. Required. */
  src: string
  maskSrc?: string
  dotsEnabled?: boolean
  dotSize?: number
  minDotSize?: number
  dotMargin?: number
  dotColor?: string
  /** Painted-dot alpha scale, 0-1. Default 1. Use this to wash the shader out, not `canvasClassName` opacity. */
  dotAlphaMultiplier?: number
  gridLayout?: 'straight' | 'radial' | 'alternating-grid'
  enableMask?: boolean
  animSpeed?: number
  gamma?: number
  loopAt?: number
  /** Hover lens radius in CSS pixels. Set 0 to disable the hover effect. Default 160. */
  hoverRadius?: number
  /** Minimum luminance floor (0-1). Dots appear even in dark video areas
   *  when this is above 0. Higher = more dots everywhere. Default 0. */
  minLuminance?: number
  /** Render style: 'dots' (circle grid) or 'ascii' (character grid). Default 'dots'. */
  dotStyle?: 'dots' | 'ascii'
  /** Characters for ASCII mode, ordered lightest to heaviest. Default ' .:-~=+x?$%#@MW'. */
  chars?: string
  /** CSS font for ASCII mode. Must be monospaced. Default 'monospace'. */
  charFont?: string
}

const DEFAULT_CONFIG: Required<Omit<VideoShaderConfig, 'src'>> = {
  maskSrc: '',
  dotsEnabled: true,
  dotSize: 6,
  minDotSize: 1,
  dotMargin: 0,
  dotColor: '#5b7cff',
  dotAlphaMultiplier: 1,
  gridLayout: 'straight',
  enableMask: false,
  animSpeed: 4,
  gamma: 0.9,
  loopAt: 4,
  hoverRadius: 160,
  minLuminance: 0.2,
  dotStyle: 'dots',
  chars: ' .:-~=+x?$%#@A',
  charFont: 'monospace',
}

// ─── Helpers ───────────────────────────────────────────────────────────────

/** Parse any common CSS color into normalized RGBA (0-1).
 *  Supports: #rgb, #rgba, #rrggbb, #rrggbbaa, rgb(), rgba(). */
function parseColorNormalized(color: string): { r: number; g: number; b: number; a: number } {
  const trimmed = color.trim()

  // rgb(r, g, b) or rgba(r, g, b, a) — values 0-255, alpha 0-1
  const rgbMatch = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i.exec(trimmed)
  if (rgbMatch) {
    return {
      r: Number(rgbMatch[1]) / 255,
      g: Number(rgbMatch[2]) / 255,
      b: Number(rgbMatch[3]) / 255,
      a: rgbMatch[4] != null ? Number(rgbMatch[4]) : 1,
    }
  }

  // Hex formats: #rgb, #rgba, #rrggbb, #rrggbbaa
  const s = trimmed.replace(/^#/, '')
  let r = 1, g = 1, b = 1, a = 1
  if (s.length === 3 || s.length === 4) {
    r = Number.parseInt(s[0]! + s[0]!, 16) / 255
    g = Number.parseInt(s[1]! + s[1]!, 16) / 255
    b = Number.parseInt(s[2]! + s[2]!, 16) / 255
    if (s.length === 4) a = Number.parseInt(s[3]! + s[3]!, 16) / 255
  } else if (s.length === 6 || s.length === 8) {
    r = Number.parseInt(s.slice(0, 2), 16) / 255
    g = Number.parseInt(s.slice(2, 4), 16) / 255
    b = Number.parseInt(s.slice(4, 6), 16) / 255
    if (s.length === 8) a = Number.parseInt(s.slice(6, 8), 16) / 255
  }
  return { r, g, b, a }
}

/** Render characters onto a single-row texture atlas using Canvas 2D.
 *  Each character occupies a square cell. Returns the GL texture + count. */
function createCharAtlas(gl: WebGLRenderingContext, chars: string, font: string): { texture: WebGLTexture; count: number } {
  const cellSize = 64 // px per character in the atlas (internal resolution)
  const atlasCanvas = document.createElement('canvas')
  atlasCanvas.width = chars.length * cellSize
  atlasCanvas.height = cellSize
  const ctx = atlasCanvas.getContext('2d')!
  ctx.fillStyle = 'black'
  ctx.fillRect(0, 0, atlasCanvas.width, atlasCanvas.height)
  ctx.fillStyle = 'white'
  ctx.font = `900 ${Math.floor(cellSize * 0.85)}px ${font}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  for (let i = 0; i < chars.length; i++) {
    ctx.fillText(chars[i]!, (i + 0.5) * cellSize, cellSize * 0.52)
  }
  const texture = gl.createTexture()!
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlasCanvas)
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  atlasCanvas.width = 0
  atlasCanvas.height = 0
  return { texture, count: chars.length }
}

// ─── Engine ────────────────────────────────────────────────────────────────

function createVideoShaderEngine(container: HTMLElement, config: Required<Omit<VideoShaderConfig, 'src'>> & { src: string; onReady?: () => void }) {
  let width = container.clientWidth
  let height = container.clientHeight
  const dpr = Math.min(2, window.devicePixelRatio || 1)

  // Canvas + WebGL context
  const canvas = document.createElement('canvas')
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = width + 'px'
  canvas.style.height = height + 'px'
  container.appendChild(canvas)

  // premultipliedAlpha: true (default) because iOS Safari's compositor ignores the
  // premultipliedAlpha flag and always composites as premultiplied. The display
  // shader pre-multiplies RGB by alpha so compositing is correct on all browsers.
  const glContext = canvas.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true })
  if (!glContext || glContext.isContextLost()) {
    canvas.remove()
    throw new Error('WebGL unavailable: could not create a webgl context')
  }
  const gl = glContext

  // Video element
  const video = document.createElement('video')
  video.src = config.src
  video.loop = false
  video.muted = true
  video.playsInline = true
  video.preload = 'auto'
  video.addEventListener('ended', () => {
    video.currentTime = config.loopAt
    video.play().catch(() => {})
  })

  // Fire onReady when the video has enough data to render a frame.
  if (config.onReady) {
    if (video.readyState >= 3) {
      config.onReady()
    } else {
      video.addEventListener('canplay', () => config.onReady!(), { once: true })
    }
  }

  // Video texture (updated from the <video> element each frame)
  const videoTex = createEmptyTexture(gl)

  // Mask texture (only load image when mask is actually enabled to avoid 404s)
  let disposed = false
  const maskTex = createEmptyTexture(gl)
  if (config.enableMask && config.maskSrc) {
    const img = new Image()
    img.onload = () => {
      if (disposed) return
      gl.bindTexture(gl.TEXTURE_2D, maskTex)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
    }
    img.src = config.maskSrc
  }

  // Character atlas for ASCII mode. Dots mode binds a 1x1 texture so the shader
  // setup stays linear without paying the Canvas 2D atlas cost for normal dots.
  const charAtlas =
    config.dotStyle === 'ascii'
      ? createCharAtlas(gl, config.chars, config.charFont)
      : { texture: createEmptyTexture(gl), count: 1 }

  // Full-screen quad (shared by all programs via fixed attrib locations)
  const quad = createQuadBuffers(gl)
  bindQuad(gl, quad)

  // ── GPU programs ──

  const displayP = createGpuProgram(gl, BASE_VERTEX, DISPLAY_FRAG)

  // ── Static uniforms (set once, persist across frames) ──

  const gridLayoutIndex = { straight: 0, radial: 1, 'alternating-grid': 2 }[config.gridLayout] || 0
  const dotRgba = parseColorNormalized(config.dotColor)

  gl.useProgram(displayP.program)
  gl.uniform1f(displayP.loc('hoverRadius'), Math.max(config.hoverRadius, 1))
  gl.uniform1f(displayP.loc('gridCellSize'), config.dotSize + config.dotMargin)
  gl.uniform1f(displayP.loc('dotRadius'), config.dotSize / 2)
  gl.uniform1f(displayP.loc('minDotRadius'), config.minDotSize / 2)
  gl.uniform2f(displayP.loc('videoResolution'), width, height)
  gl.uniform1f(displayP.loc('animSpeed'), config.animSpeed)
  gl.uniform1f(displayP.loc('gamma'), config.gamma)
  gl.uniform1i(displayP.loc('gridLayout'), gridLayoutIndex)
  gl.uniform3f(displayP.loc('dotColor'), dotRgba.r, dotRgba.g, dotRgba.b)
  // Multiply explicit dotAlphaMultiplier with alpha parsed from the hex color
  gl.uniform1f(displayP.loc('dotAlphaMultiplier'), config.dotAlphaMultiplier * dotRgba.a)
  gl.uniform1i(displayP.loc('enableMask'), config.enableMask ? 1 : 0)
  gl.uniform1i(displayP.loc('dotsEnabled'), config.dotsEnabled ? 1 : 0)
  gl.uniform1f(displayP.loc('minLuminance'), config.minLuminance)
  gl.uniform1i(displayP.loc('dotStyle'), config.dotStyle === 'ascii' ? 1 : 0)
  gl.uniform1f(displayP.loc('charCount'), charAtlas.count)

  // ── Pointer lens ──
  //
  // Store the last client position and resolve it against the container rect
  // every frame, so scrolling under a resting pointer keeps the lens correct.
  // Listen on window: foreground content (headings, buttons) sits above the
  // canvas container and would swallow container-level events.

  let clientX = 0
  let clientY = 0
  let hasPointer = false
  const lens = { x: 0, y: 0, strength: 0 }

  function onPointerMove(e: PointerEvent) {
    clientX = e.clientX
    clientY = e.clientY
    hasPointer = true
  }
  function onPointerGone(e: PointerEvent) {
    // Touch pointers vanish on lift. Mouse leaving the page fires pointerout
    // with no relatedTarget.
    if (e.pointerType === 'touch' || !e.relatedTarget) hasPointer = false
  }
  const hoverEnabled = config.hoverRadius > 0
  if (hoverEnabled) {
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    window.addEventListener('pointerup', onPointerGone, { passive: true })
    window.addEventListener('pointerout', onPointerGone, { passive: true })
  }

  function updateLens(dt: number) {
    const rect = container.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    const inside = hasPointer && x >= 0 && y >= 0 && x <= rect.width && y <= rect.height
    // Shader pixel space has y pointing up
    const targetY = rect.height - y
    if (inside && lens.strength < 0.01) {
      // Appear where the pointer is instead of sliding in from the old spot
      lens.x = x
      lens.y = targetY
    }
    if (inside) {
      const follow = 1 - Math.exp(-dt * 14)
      lens.x += (x - lens.x) * follow
      lens.y += (targetY - lens.y) * follow
    }
    const fade = 1 - Math.exp(-dt * 6)
    lens.strength += ((inside ? 1 : 0) - lens.strength) * fade
  }

  // ── Animation loop ──

  let animId: number
  let lastTime = performance.now()
  const startTime = performance.now()

  let tryPlay: (() => void) | undefined

  video.play().catch(() => {
    tryPlay = () => {
      video.play().catch(() => {})
      if (tryPlay) document.removeEventListener('click', tryPlay)
      tryPlay = undefined
    }
    document.addEventListener('click', tryPlay)
  })

  function animate() {
    animId = requestAnimationFrame(animate)
    // iOS Safari loses WebGL contexts under memory pressure / backgrounding.
    // A lost context makes most GL calls no-ops but per-frame texImage2D from
    // a video can still throw — stop drawing instead of throwing every frame.
    if (gl.isContextLost()) return
    const now = performance.now()
    const dt = Math.min((now - lastTime) / 1000, 0.033)
    lastTime = now

    try {
      if (video.readyState >= video.HAVE_CURRENT_DATA) {
        gl.bindTexture(gl.TEXTURE_2D, videoTex)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
      }

      if (hoverEnabled) updateLens(dt)

      gl.useProgram(displayP.program)
      gl.uniform1f(displayP.loc('time'), (now - startTime) / 1000)
      gl.uniform2f(displayP.loc('pointer'), lens.x, lens.y)
      gl.uniform1f(displayP.loc('pointerStrength'), lens.strength)
      setTexture(gl, displayP, 'uVideo', videoTex, 1)
      setTexture(gl, displayP, 'uMask', maskTex, 2)
      setTexture(gl, displayP, 'uCharAtlas', charAtlas.texture, 3)
      drawToScreen(gl)
    } catch (error) {
      // Never let a runtime WebGL failure become an uncaught error storm —
      // stop the loop and leave the page content intact.
      cancelAnimationFrame(animId)
      console.warn('VideoBackgroundShader: render loop stopped', error)
    }
  }

  function onContextLost(e: Event) {
    e.preventDefault()
    cancelAnimationFrame(animId)
  }
  canvas.addEventListener('webglcontextlost', onContextLost)

  animate()

  // ── Resize ──

  function onResize() {
    width = container.clientWidth
    height = container.clientHeight
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = width + 'px'
    canvas.style.height = height + 'px'
    gl.useProgram(displayP.program)
    gl.uniform2f(displayP.loc('videoResolution'), width, height)
  }

  const resizeObserver = new ResizeObserver(onResize)
  resizeObserver.observe(container)

  // ── Cleanup ──

  function cleanup() {
    disposed = true
    cancelAnimationFrame(animId)
    canvas.removeEventListener('webglcontextlost', onContextLost)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', onPointerGone)
    window.removeEventListener('pointerout', onPointerGone)
    if (tryPlay) document.removeEventListener('click', tryPlay)
    resizeObserver.disconnect()
    video.pause()
    video.src = ''
    displayP.dispose(gl)
    gl.deleteTexture(videoTex)
    gl.deleteTexture(maskTex)
    gl.deleteTexture(charAtlas.texture)
    gl.deleteBuffer(quad.positionBuffer)
    gl.deleteBuffer(quad.uvBuffer)
    if (canvas.parentElement) {
      canvas.parentElement.removeChild(canvas)
    }
    const loseContext = gl.getExtension('WEBGL_lose_context')
    if (loseContext) loseContext.loseContext()
  }

  return { cleanup, canvas, video }
}

// ─── Gradient helpers ──────────────────────────────────────────────────────

const TOP_GRADIENT = [
  'linear-gradient(to bottom,',
  'color-mix(in srgb, var(--background) 70%, transparent) 0%,',
  'color-mix(in srgb, var(--background) 50%, transparent) 20%,',
  'color-mix(in srgb, var(--background) 50%, transparent) 40%,',
  'transparent 55%)',
].join(' ')

const BOTTOM_GRADIENT = [
  'linear-gradient(to top,',
  'color-mix(in srgb, var(--background) 70%, transparent) 0%,',
  'color-mix(in srgb, var(--background) 50%, transparent) 20%,',
  'color-mix(in srgb, var(--background) 50%, transparent) 40%,',
  'transparent 55%)',
].join(' ')

// ─── React component ───────────────────────────────────────────────────────

export interface VideoBackgroundShaderProps extends Omit<VideoShaderConfig, 'src'> {
  /** Video source path (required). */
  src: string
  /** Content rendered over the video background. */
  children?: ReactNode
  className?: string
  /** Extra classes on the canvas container only (not gradients or children).
   *  CSS opacity here fades the whole layer. To wash the dots out, use `dotAlphaMultiplier`. */
  canvasClassName?: string
  /** Show top gradient overlay fading into page background. Default true. */
  fadeTop?: boolean
  /** Show bottom gradient overlay fading into page background. Default true. */
  fadeBottom?: boolean
  /** Maximum width for the shader canvas in pixels. Prevents the shader from
   *  stretching too wide on ultra-wide monitors. Default 2200. */
  maxWidth?: number
}

export function VideoBackgroundShader({
  children,
  className,
  canvasClassName,
  src,
  fadeTop = true,
  fadeBottom = true,
  maxWidth = 2200,
  ...config
}: VideoBackgroundShaderProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [canvasReady, setCanvasReady] = useState(false)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Safety timeout: show content after 3s even if video never loads
    const timeout = setTimeout(() => setCanvasReady(true), 3000)

    // Engine creation can fail on devices where WebGL is unavailable or the
    // context is immediately lost (older iOS, low power mode, tab limits).
    // A throw here would unmount the whole React tree, taking the entire site
    // down — so degrade gracefully: no shader background, content still shows.
    let engine: ReturnType<typeof createVideoShaderEngine> | undefined
    try {
      engine = createVideoShaderEngine(container, {
        ...DEFAULT_CONFIG,
        ...config,
        src,
        onReady() {
          clearTimeout(timeout)
          setCanvasReady(true)
        },
      })
    } catch (error) {
      console.warn('VideoBackgroundShader: WebGL init failed, rendering without shader background', error)
      // Remove any canvas the failed engine left behind (React does not manage
      // the container's children, so manual cleanup is safe here)
      for (const orphan of container.querySelectorAll('canvas')) orphan.remove()
      clearTimeout(timeout)
      setCanvasReady(true)
    }

    return () => {
      clearTimeout(timeout)
      try {
        engine?.cleanup()
      } catch (error) {
        console.warn('VideoBackgroundShader: cleanup failed', error)
      }
    }
  }, [src, ...Object.values(config)])

  const fadeTransition = 'opacity 0.4s cubic-bezier(0.23, 1, 0.32, 1)'

  return (
    <div className={cn('relative flex flex-col items-center overflow-hidden', className)}>
      {/* WebGL canvas container */}
      <div
        ref={containerRef}
        className={cn(
          'absolute inset-0 w-full h-full z-0 overflow-hidden',
          canvasClassName,
          !canvasReady && 'opacity-0!',
        )}
        style={{
          maxWidth,
          margin: '0 auto',
          transition: fadeTransition,
        }}
      />

      {/* Top gradient overlay */}
      {fadeTop && (
        <div
          className='absolute top-0 inset-x-0 h-[15%] z-[1] pointer-events-none'
          style={{
            background: TOP_GRADIENT,
            opacity: canvasReady ? 1 : 0,
            transition: fadeTransition,
          }}
        />
      )}

      {/* Bottom gradient overlay */}
      {fadeBottom && (
        <div
          className='absolute bottom-0 inset-x-0 h-[12%] z-[1] pointer-events-none'
          style={{
            background: BOTTOM_GRADIENT,
            opacity: canvasReady ? 1 : 0,
            transition: fadeTransition,
          }}
        />
      )}

      {/* Foreground content */}
      {Boolean(children) && (
        <div
          className='relative z-[2] flex flex-col items-center justify-center text-center w-full px-5 py-16 sm:py-24 gap-6'
          style={{
            opacity: canvasReady ? 1 : 0,
            transition: 'opacity 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
          }}
        >
          {children}
        </div>
      )}
    </div>
  )
}
