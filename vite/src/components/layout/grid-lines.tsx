/**
 * Decorative grid lines — cosmetic border lines framing the page layout.
 * Renders vertical lines outside the max-width content edges (offset by
 * --grid-line-offset), a horizontal bottom border, and dots at the tab
 * bar border aligned with the vertical lines.
 *
 * Configurable via `decorativeLines` in docs.json / holocron.jsonc:
 *   - "none"            — no decorative lines
 *   - "lines"           — solid 1px lines
 *   - "dashed"          — dashed/segmented lines
 *   - "lines-with-dots"    — solid lines + dot ornaments at vertices (default)
 *   - "lines-with-crosses" — solid lines + small + ornaments
 *   - "lines-with-x"       — solid lines + small x ornaments
 *   - "lines-with-circles" — solid lines + small hollow circle ornaments
 *
 * Line positions (desktop only):
 *   - 2 outer vertical lines offset outside the max-width edges
 *   - 1 horizontal bottom border below the content area
 *   - Ornaments at every line intersection when mode is "lines-with-*"
 *   - Ornaments on the tab-bar border aligned with the vertical lines
 *
 * All elements are aria-hidden, pointer-events-none — purely visual.
 * Only rendered at lg: breakpoint (desktop); hidden on mobile.
 */

import React from 'react'
import type { HolocronConfig } from '../../config.ts'

export type DecorativeMode = HolocronConfig['decorativeLines']

type OrnamentShape = 'dot' | 'cross' | 'x' | 'circle'

const ORNAMENT_BY_MODE: Record<DecorativeMode, OrnamentShape | null> = {
  none: null,
  lines: null,
  dashed: null,
  'lines-with-dots': 'dot',
  'lines-with-crosses': 'cross',
  'lines-with-x': 'x',
  'lines-with-circles': 'circle',
}

/** Gap between content edge and decorative line — lives in CSS as
 *  `--grid-line-offset` so it can be themed. Default 20px. */
const LINE_OFFSET = 'var(--grid-line-offset, 20px)'

/* ── GridDot ──────────────────────────────────────────────────────────── */

/** Decorative ornament placed at border intersections. Must be inside a relative container.
 *  Outer circle masks the border crossing with page bg, `::after` draws the shape. */
function GridDot({ shape, style }: { shape: OrnamentShape; style?: React.CSSProperties }) {
  return (
    <div
      aria-hidden
      data-shape={shape}
      className='grid-dot hidden lg:flex'
      style={style}
    />
  )
}

/* ── Shared helpers ───────────────────────────────────────────────────── */

const lineClass = (mode: DecorativeMode) =>
  mode === 'dashed' ? 'dashed' : 'solid'

/* Line positions — offset outside the max-width box */
const lineLeft = `calc(-1 * ${LINE_OFFSET})`
const lineRight = `calc(-1 * ${LINE_OFFSET})`

/* Dot positions at corners — centered on the line, which is offset outside */
const dot = {
  tl: { top: 0, left: lineLeft, transform: 'translate(-50%, -50%)' } as React.CSSProperties,
  tr: { top: 0, right: lineRight, transform: 'translate(50%, -50%)' } as React.CSSProperties,
  bl: { bottom: 0, left: lineLeft, transform: 'translate(-50%, -50%)' } as React.CSSProperties,
  br: { bottom: 0, right: lineRight, transform: 'translate(50%, -50%)' } as React.CSSProperties,
}

/* ── GridLines ────────────────────────────────────────────────────────── */

/**
 * Decorative lines for the page frame — outer verticals (offset outside
 * the max-width), bottom horizontal, and dot ornaments at intersections.
 *
 * Placed inside a relative wrapper at max-width. Lines are offset
 * outward by --grid-line-offset:
 *
 * ```
 *  •  ┊━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┊  •  ← tab-bar border + dots
 *  ┃  ┊  nav sidebar     main content   right rail ┊  ┃
 *  ┃  ┊                                            ┊  ┃
 *  ┃  ┊← max-width edges                          →┊  ┃
 *  ┃  ┊                                            ┊  ┃
 *  •━━┻━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┻━━•  ← bottom + dots
 * ```
 */
export function GridLinesFrame({ mode }: { mode: DecorativeMode }) {
  if (mode === 'none') return null
  const cls = lineClass(mode)
  const shape = ORNAMENT_BY_MODE[mode]

  return (
    <>
      {/* ── Outer vertical lines (offset outside max-width edges) ── */}
      <div aria-hidden className={`grid-line-v ${cls} hidden lg:block`} style={{ left: lineLeft }} />
      <div aria-hidden className={`grid-line-v ${cls} hidden lg:block`} style={{ right: lineRight }} />

      {/* ── Dots at bottom end of vertical lines ── */}
      {shape && (
        <>
          <GridDot shape={shape} style={dot.bl} />
          <GridDot shape={shape} style={dot.br} />
        </>
      )}
    </>
  )
}

/**
 * Dots at the bottom edge of the Above/hero section — marks where the
 * vertical lines cross the Above boundary. Must be inside a relative
 * container within the max-width frame wrapper.
 */
export function AboveBottomDots({ mode }: { mode: DecorativeMode }) {
  const shape = ORNAMENT_BY_MODE[mode]
  if (!shape) return null
  /* Pull dots up from the bottom edge so they sit inside the Above content
     rather than at the very bottom boundary. */
  const bl = { ...dot.bl, bottom: 'var(--layout-gap)' }
  const br = { ...dot.br, bottom: 'var(--layout-gap)' }
  return (
    <>
      <GridDot shape={shape} style={bl} />
      <GridDot shape={shape} style={br} />
    </>
  )
}

/**
 * Dots on the tab-bar border — aligned with the vertical line positions.
 * Placed inside the full-width slot-tabbar (position: relative).
 * Uses `calc(50% - max-width/2 - offset)` to position dots at the
 * same X as the vertical lines regardless of viewport width.
 */
/* In a full-width parent, position at same X as the vertical lines:
   left = 50% - max-width/2 - offset */
const fullWidthLeftX = `calc(50% - var(--grid-max-width) / 2 - ${LINE_OFFSET})`
const fullWidthRightX = `calc(50% - var(--grid-max-width) / 2 - ${LINE_OFFSET})`

export function TabBarDots({ mode }: { mode: DecorativeMode }) {
  const shape = ORNAMENT_BY_MODE[mode]
  if (!shape) return null
  return (
    <>
      {/* Top border dots */}
      <GridDot shape={shape} style={{ top: 0, left: fullWidthLeftX, transform: 'translate(-50%, -50%)' }} />
      <GridDot shape={shape} style={{ top: 0, right: fullWidthRightX, transform: 'translate(50%, -50%)' }} />
      {/* Bottom border dots */}
      <GridDot shape={shape} style={{ bottom: 0, left: fullWidthLeftX, transform: 'translate(-50%, 50%)' }} />
      <GridDot shape={shape} style={{ bottom: 0, right: fullWidthRightX, transform: 'translate(50%, 50%)' }} />
    </>
  )
}

/**
 * Vertical decorative lines inside the navbar — full-height of the navbar,
 * aligned with the outer frame vertical lines. Placed inside the full-width
 * slot-navbar (position: relative).
 */
export function NavbarLines({ mode }: { mode: DecorativeMode }) {
  if (mode === 'none') return null
  const cls = lineClass(mode)
  return (
    <>
      <div
        aria-hidden
        className={`grid-line-v ${cls} hidden lg:block`}
        style={{ left: fullWidthLeftX }}
      />
      <div
        aria-hidden
        className={`grid-line-v ${cls} hidden lg:block`}
        style={{ right: fullWidthRightX }}
      />
    </>
  )
}
