/**
 * Shared MDX builder for virtual tab providers (OpenAPI, changelog, etc.).
 *
 * Virtual providers generate MDX strings that flow through the same
 * enrichment/render pipeline as on-disk pages. This helper composes the
 * three common parts — a YAML frontmatter block, an optional `<Aside full>`
 * notice column, and the page body — so providers don't each reinvent the
 * fragile string-joining (and so the frontmatter escaping stays in one place).
 */

import path from 'node:path'
import { commonMarkToMdx } from './normalize-mdx.ts'

/** Compute the virtual directory for a virtual page slug.
 *  A virtual page at slug `changelog` lives in `pagesDir/`.
 *  A virtual page at slug `releases/notes` lives in `pagesDir/releases/`.
 *  Used by both the changelog provider (to compute import paths) and
 *  sync.ts (to resolve inline imports from that virtual directory). */
export function virtualPageDir(pagesDir: string, slug: string): string {
  return path.join(pagesDir, slug.includes('/') ? path.dirname(slug) : '')
}

/** A frontmatter value. Strings are quoted + escaped; numbers/booleans are
 *  emitted raw. `undefined` keys are skipped. */
export type FrontmatterValue = string | number | boolean | undefined

/** Serialize a single frontmatter entry. A JSON string is a valid YAML
 *  double-quoted scalar, so JSON.stringify escapes quotes and control chars. */
function frontmatterLine(key: string, value: Exclude<FrontmatterValue, undefined>): string {
  if (typeof value === 'string') return `${key}: ${JSON.stringify(value.replace(/\s*[\r\n]+\s*/g, ' '))}`
  return `${key}: ${value}`
}

/* ── Escaping helpers ────────────────────────────────────────────────── */
//
// Generated pages embed text from specs (OpenAPI, MCP, GitHub releases) that
// is plain Markdown or code, never MDX. Every piece goes in through one of
// these helpers, so `{`, `<` or ``` in the source cannot break the page:
//
//   structured data  → JSON props:        <Name {...{"description":"..."}} />
//   Markdown prose   → escaped children:  commonMarkToMdx (\{ and \<)
//   code             → codeFence:         fence longer than any backtick run

/** Pick a backtick fence longer than any run inside `source` so nested ``` cannot close early. */
export function fenceMarker(source: string): string {
  let longest = 0
  for (const match of source.matchAll(/`+/g)) {
    if (match[0].length > longest) longest = match[0].length
  }
  return '`'.repeat(Math.max(3, longest + 1))
}

/** Escape a string for use inside a code-fence `title="..."` meta. */
export function fenceTitle(name: string): string {
  return name
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/`/g, "'")
    .replace(/[\r\n]+/g, ' ')
}

/** Lines of a fenced code block. `info` is the language plus meta, e.g. `json lines=false`. */
export function codeFence({ info, code }: { info: string; code: string }): string[] {
  const fence = fenceMarker(code)
  return [`${fence}${info}`, code, fence]
}

/**
 * A component with JSON spread props and optional Markdown children.
 * The Markdown is escaped to MDX, so the page source stays readable in the
 * `.md` export and nothing in it can become JSX or an expression.
 */
export function componentWithMarkdown({ name, props, markdown }: {
  name: string
  props: Record<string, unknown>
  markdown?: string
}): string {
  const open = `<${name} {...${JSON.stringify(props)}}`
  const children = markdown?.trim() ? commonMarkToMdx(markdown).trim() : ''
  if (!children) return `${open} />`
  return [`${open}>`, '', children, '', `</${name}>`].join('\n')
}

/**
 * Build a virtual MDX page string.
 *
 * Layout:
 *   ---
 *   <frontmatter>
 *   ---
 *
 *   import ...         (only when `imports` is provided)
 *
 *   <Aside full>      (only when `aside` is provided)
 *   <aside content>
 *   </Aside>
 *
 *   <body>
 */
export function buildVirtualPageMdx({
  frontmatter,
  imports,
  aside,
  body,
}: {
  frontmatter: Record<string, FrontmatterValue>
  /** Raw import declaration lines to place after frontmatter. MDX requires
   *  imports before any non-import content. */
  imports?: string[]
  aside?: string
  body: string
}): string {
  const fmLines = Object.entries(frontmatter)
    .filter((entry): entry is [string, Exclude<FrontmatterValue, undefined>] => entry[1] !== undefined)
    .map(([key, value]) => frontmatterLine(key, value))

  const parts: string[] = ['---', ...fmLines, '---', '']

  if (imports && imports.length > 0) {
    parts.push(...imports, '')
  }

  if (aside !== undefined) {
    parts.push('<Aside full>', '', aside.trim(), '', '</Aside>', '')
  }

  parts.push(body)
  return parts.join('\n')
}
