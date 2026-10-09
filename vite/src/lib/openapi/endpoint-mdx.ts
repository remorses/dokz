/**
 * Builds the virtual MDX page for one OpenAPI operation.
 *
 * Shared by the Vite plugin provider (provider.ts) and the standalone
 * generator (generate.ts). No filesystem access, so generate.ts stays usable
 * in multi-tenant pipelines without node:fs.
 */

import type { OpenAPIV3 } from 'openapi-types'
import type { ExtractedOperation, DereferencedDocument } from './process.ts'
import type { ConfigNavGroup } from '../../config.ts'
import {
  getOperationPageOverrides,
  operationPageSlug,
  operationSidebarTitle,
  operationTitle,
  resolveSecurity,
  resolveServerUrl,
  tagDisplayName,
  DEFAULT_TAG,
} from './process.ts'
import { generateCurl } from './curl-generator.ts'
import { buildVirtualPageMdx } from '../virtual-page-mdx.ts'
import { commonMarkToMdx } from '../normalize-mdx.ts'
import { codeSampleFenceBlocks, extractCodeSamples, fenceTitle } from './code-samples.ts'

export type OpWithDoc = { op: ExtractedOperation; doc: DereferencedDocument }

/**
 * Emits generated pages into `pages` (slug → MDX). Shared by the Vite provider
 * and the standalone generator so both produce the same pages and navigation.
 * `where` names the source in error messages, e.g. `tab "API"`.
 */
export function createPageEmitter({ slugPrefix, pages, where, specPaths }: {
  slugPrefix: string
  pages: Record<string, string>
  where: string
  /** Root-relative path each spec is served at; endpoint pages link to it. */
  specPaths?: Map<DereferencedDocument, string>
}) {
  // Referencing the SAME endpoint twice dedups; two DISTINCT operations on one
  // slug (e.g. same METHOD+path in two specs under one base) is an error.
  const emitted = new Map<string, OpWithDoc>()

  /** Build + register one endpoint page; returns its slug. */
  const emitEndpoint = (item: OpWithDoc): string => {
    const { op } = item
    const slug = operationPageSlug(op, slugPrefix)
    const existing = emitted.get(slug)
    if (existing) {
      if (existing === item) return slug
      throw new Error(
        `[holocron] ${where}: two OpenAPI operations map to the same page slug "${slug}" ` +
        `(${existing.op.method.toUpperCase()} ${existing.op.path} and ${op.method.toUpperCase()} ${op.path}). ` +
        `Use distinct base prefixes or set x-holocron.href.`,
      )
    }
    emitted.set(slug, item)
    pages[slug] = buildEndpointMdx({ ...item, specPath: specPaths?.get(item.doc) })
    return slug
  }

  /** One sidebar group per first tag, in spec order. Mintlify `x-hidden`
   *  operations still get a page but stay out of the sidebar. */
  const tagGroups = (items: OpWithDoc[]): ConfigNavGroup[] => {
    const byTag = new Map<string, OpWithDoc[]>()
    for (const item of items) {
      const tag = item.op.tags[0] ?? DEFAULT_TAG
      byTag.set(tag, [...(byTag.get(tag) ?? []), item])
    }
    return [...byTag].flatMap(([tag, ops]) => {
      const pages = ops.flatMap((item) => {
        const slug = emitEndpoint(item)
        return item.op.operation['x-hidden'] === true ? [] : [slug]
      })
      return pages.length > 0 ? [{ group: tagDisplayName(tag, ops[0]!.doc), pages }] : []
    })
  }

  /** Overview page from the first spec with an `info.description`, as an
   *  untitled group in front of `groups`. Only for tabs with no authored pages. */
  const withOverview = (groups: ConfigNavGroup[], docs: DereferencedDocument[]): ConfigNavGroup[] => {
    const overview = docs.map(buildOverviewMdx).find(Boolean)
    if (!overview) return groups
    const slug = slugPrefix ? `${slugPrefix}/overview` : 'overview'
    if (pages[slug]) {
      throw new Error(`[holocron] ${where}: the OpenAPI overview page "${slug}" collides with an endpoint page. Set x-holocron.href on that endpoint.`)
    }
    pages[slug] = overview
    return [{ group: '', pages: [slug] }, ...groups]
  }

  return { emitEndpoint, tagGroups, withOverview }
}

/** Build the virtual MDX string for a single OpenAPI operation. */
export function buildEndpointMdx({ op, doc, specPath }: { op: ExtractedOperation; doc: DereferencedDocument; specPath?: string }): string {
  const overrides = getOperationPageOverrides(op)
  const title = operationTitle(op)
  const sidebarTitle = operationSidebarTitle(op)
  const curl = generateCurl(op, doc)
  const params = op.parameters.map((p) => ({
    name: p.name,
    in: p.in,
    required: p.required,
    deprecated: p.deprecated,
    description: p.description,
    schema: p.schema ? simplifySchema(p.schema as Record<string, unknown>) : undefined,
  }))

  const requestBody = (() => {
    const body = op.operation.requestBody as OpenAPIV3.RequestBodyObject | undefined
    if (!body?.content) return undefined
    // Prefer application/json, fall back to any JSON-like type, then first available
    const jsonKey = Object.keys(body.content).find((k) => k === 'application/json')
      ?? Object.keys(body.content).find((k) => k.includes('json'))
      ?? Object.keys(body.content)[0]
    if (!jsonKey) return undefined
    const media = body.content[jsonKey]!
    return {
      required: body.required,
      description: body.description,
      contentType: jsonKey,
      schema: media.schema ? simplifySchema(media.schema as Record<string, unknown>) : undefined,
      examples: collectExamples(media),
    }
  })()

  const responses = Object.entries(op.operation.responses ?? {}).map(([status, resp]) => {
    const r = resp as OpenAPIV3.ResponseObject
    // Prefer application/json, fall back to any JSON-like type
    const jsonKey = r.content
      ? (Object.keys(r.content).find((k) => k === 'application/json')
        ?? Object.keys(r.content).find((k) => k.includes('json')))
      : undefined
    const jsonContent = jsonKey && r.content ? r.content[jsonKey] : undefined
    const examples = collectExamples(jsonContent)
    return {
      status,
      description: r.description,
      schema: jsonContent?.schema ? simplifySchema(jsonContent.schema as Record<string, unknown>) : undefined,
      // Keep `example` for backwards compatibility / single-example callers.
      example: examples[0]?.value,
      examples,
    }
  })

  // Use the operation's own doc for security lookups (correct for multi-spec)
  const { optional: authOptional, schemes: security } = resolveSecurity(op, doc)

  const servers = op.servers.map((s) => ({
    url: resolveServerUrl(s),
    description: s.description,
  }))

  const propsJson = JSON.stringify({
    method: op.method,
    path: op.path,
    summary: op.operation.summary,
    description: overrides.description ?? op.operation.description,
    parameters: params,
    requestBody,
    responses,
    security,
    authOptional,
    servers,
    deprecated: op.operation.deprecated,
  })

  // Request example tabs: cURL first, then x-codeSamples (SDK snippets from
  // Stainless / Speakeasy / hey-api / hand-written), then named request-body
  // JSON examples. RequestExample renders each titled fence as a switchable
  // tab — no <CodeGroup> wrapper. `lines=false` hides line numbers.
  const requestExampleBlocks: string[] = [
    '```bash title="cURL" lines=false',
    curl,
    '```',
    ...codeSampleFenceBlocks(extractCodeSamples(op.operation)),
  ]
  if (requestBody?.examples && requestBody.examples.length > 0) {
    requestExampleBlocks.push(...exampleCodeBlocks(requestBody.examples))
  }

  // Response examples: collect ALL statuses that define examples, not just one.
  // When multiple statuses have examples, prefix tab titles with the status code
  // so the user can distinguish e.g. "201 — Success" from "401 — Unauthorized".
  const responsesWithExamples = responses.filter((r) => r.examples.length > 0)
  const prefixStatus = responsesWithExamples.length > 1
  const responseExampleBlocks = responsesWithExamples.flatMap((r) =>
    prefixStatus
      ? exampleCodeBlocks(r.examples.map((ex) => ({ ...ex, name: `${r.status} — ${ex.name}` })))
      : exampleCodeBlocks(r.examples),
  )

  const wrap = (tag: string, blocks: string[]): string[] => {
    return [`<${tag}>`, '', ...blocks, '', `</${tag}>`]
  }

  const aside = [
    ...wrap('RequestExample', requestExampleBlocks),
    ...(responseExampleBlocks.length > 0
      ? ['', ...wrap('ResponseExample', responseExampleBlocks)]
      : []),
  ].join('\n')

  return buildVirtualPageMdx({
    frontmatter: {
      title,
      // Sidebar already shows a method badge, so strip the method from the label.
      ...(sidebarTitle !== title ? { sidebarTitle } : {}),
      // Flatten markdown to plain text for the page <meta> description.
      description: plainText(overrides.description ?? op.operation.description ?? op.operation.summary ?? '').slice(0, 200),
      api: `${op.method.toUpperCase()} ${op.path}`,
      ...(specPath ? { openapiSpec: specPath } : {}),
      gridGap: 30,
      mode: 'default',
      ...(op.operation.deprecated ? { deprecated: true } : {}),
    },
    aside,
    body: overrides.content?.trim()
      ? `<OpenAPIEndpoint {...${propsJson}}>\n${overrides.content.trim()}\n</OpenAPIEndpoint>`
      : `<OpenAPIEndpoint {...${propsJson}} />`,
  })
}

/* ── Helpers ─────────────────────────────────────────────────────────── */

/** Strip common Markdown syntax to plain text for use in <meta> descriptions.
 *  Keeps link/emphasis text, drops the markup around it. Not a full parser —
 *  just enough to avoid leaking `[x](y)`, `##`, or backticks into meta tags. */
function plainText(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, ' ')        // fenced code blocks
    .replace(/`([^`]+)`/g, '$1')            // inline code
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1') // images → alt text
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1') // links → link text
    .replace(/^#{1,6}\s+/gm, '')            // ATX headings
    .replace(/(\*\*|__|\*|_)/g, '')          // bold/italic markers
    .replace(/^\s*[-*+]\s+/gm, '')           // list bullets
    .replace(/\s+/g, ' ')                    // collapse whitespace
    .trim()
}

/** Keys the field renderer uses; everything else is dropped from the page props. */
const SCHEMA_KEYS = [
  'type', 'format', 'title', 'description', 'required', 'properties', 'items',
  'enum', 'const', 'default', 'example', 'examples', 'oneOf', 'anyOf', 'allOf', 'additionalProperties',
  'nullable', 'deprecated', 'readOnly', 'writeOnly',
  'minimum', 'maximum', 'exclusiveMinimum', 'exclusiveMaximum',
  'minLength', 'maxLength', 'pattern', 'minItems', 'maxItems',
]

/** Simplify a schema object for serialization (strip non-essential fields). */
function simplifySchema(schema: Record<string, unknown>): Record<string, unknown> {
  if (!schema || typeof schema !== 'object') return schema
  const result: Record<string, unknown> = {}
  for (const key of SCHEMA_KEYS) {
    if (!(key in schema)) continue
    const value = schema[key]
    if (key === 'properties' && value && typeof value === 'object') {
      const props: Record<string, unknown> = {}
      for (const [k, v] of Object.entries(value)) {
        props[k] = simplifySchema(v as Record<string, unknown>)
      }
      result[key] = props
    } else if (key === 'items' && value && typeof value === 'object') {
      result[key] = simplifySchema(value as Record<string, unknown>)
    } else if ((key === 'oneOf' || key === 'anyOf' || key === 'allOf') && Array.isArray(value)) {
      result[key] = value.map((v: unknown) => simplifySchema(v as Record<string, unknown>))
    } else {
      result[key] = value
    }
  }
  const enumDescriptions = readEnumDescriptions(schema)
  if (enumDescriptions) result.enumDescriptions = enumDescriptions
  const pills = readPills(schema)
  if (pills) result.pills = pills
  return result
}

/** Mintlify parameter pills: `x-mint.pre` / `x-mint.post` string arrays
 *  (`x-holocron` works the same). Rendered before / after the field name. */
function readPills(schema: Record<string, unknown>): { pre?: string[]; post?: string[] } | undefined {
  const strings = (value: unknown): string[] =>
    Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string' && v.trim() !== '') : []
  const ext = (key: string): Record<string, unknown> => {
    const value = schema[key]
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : {}
  }
  const pre = [...strings(ext('x-mint').pre), ...strings(ext('x-holocron').pre)]
  const post = [...strings(ext('x-mint').post), ...strings(ext('x-holocron').post)]
  if (pre.length === 0 && post.length === 0) return undefined
  return { ...(pre.length > 0 && { pre }), ...(post.length > 0 && { post }) }
}

/**
 * Per-value enum descriptions, normalized to `{ value: description }`.
 * Accepts Redocly's `x-enumDescriptions` map and openapi-generator's
 * `x-enum-descriptions` array (aligned with `enum`).
 */
function readEnumDescriptions(schema: Record<string, unknown>): Record<string, string> | undefined {
  const raw = schema['x-enumDescriptions'] ?? schema['x-enum-descriptions']
  const values = Array.isArray(schema.enum) ? schema.enum : []
  const entries: [string, string][] = Array.isArray(raw)
    ? raw.flatMap((d, i) => (typeof d === 'string' && i < values.length ? [[String(values[i]), d]] : []))
    : raw && typeof raw === 'object'
      ? Object.entries(raw).filter((e): e is [string, string] => typeof e[1] === 'string')
      : []
  return entries.length > 0 ? Object.fromEntries(entries) : undefined
}

/** A named OpenAPI example: the map key becomes the tab label. */
interface NamedExample {
  name: string
  value: unknown
}

/**
 * Collect every example from a media-type object, preserving names/order.
 *
 * OpenAPI media types may carry a singular `example` and/or a plural
 * `examples` map of `{ [name]: { value } }`. We merge both into an ordered
 * list of named examples so the renderer can show all of them (issue #96).
 * The singular `example` (when present and not duplicated by the map) is
 * labeled "Example".
 */
function collectExamples(
  media: { example?: unknown; examples?: Record<string, unknown> } | undefined,
): NamedExample[] {
  if (!media) return []
  const out: NamedExample[] = []
  if (media.examples && typeof media.examples === 'object') {
    for (const [name, raw] of Object.entries(media.examples)) {
      if (raw && typeof raw === 'object') {
        const obj = raw as Record<string, unknown>
        // OpenAPI Example Object: use the inline `value`. Skip entries that
        // only carry `externalValue` (a URL) — there is no inline payload to
        // show and rendering the metadata object as JSON would be misleading.
        if ('value' in obj) out.push({ name, value: obj.value })
        else if (!('externalValue' in obj)) out.push({ name, value: raw })
        continue
      }
      out.push({ name, value: raw })
    }
  }
  if (media.example !== undefined && out.length === 0) {
    out.push({ name: 'Example', value: media.example })
  }
  return out
}

/** Render named examples as titled ```json fences for an <CodeGroup>. */
function exampleCodeBlocks(examples: NamedExample[]): string[] {
  return examples.flatMap((ex) => {
    const json = typeof ex.value === 'string'
      ? ex.value
      : JSON.stringify(ex.value, null, 2)
    // `title` meta becomes the tab label after remarkCodeGroup rewrites it.
    return [`\`\`\`json title="${fenceTitle(ex.name)}" lines=false`, json, '```']
  })
}

/**
 * Overview page from the spec's `info.description`, for dedicated-mode tabs
 * that have no authored intro page. Undefined when the spec has no description.
 * The description is Markdown by spec, so it is rendered as the page body.
 */
function buildOverviewMdx(doc: DereferencedDocument): string | undefined {
  const info = doc.dereferenced.info
  const description = info?.description?.trim()
  if (!description) return undefined
  return buildVirtualPageMdx({
    frontmatter: {
      title: info.title || 'API overview',
      sidebarTitle: 'Overview',
      description: plainText(description).slice(0, 200),
    },
    // Plain page body, so headings get anchors and enter the TOC. Escaped:
    // spec Markdown often has `{` and `<` that MDX would parse.
    body: commonMarkToMdx(description),
  })
}
