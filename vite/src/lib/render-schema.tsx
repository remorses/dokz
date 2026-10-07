/**
 * Shared JSON Schema rendering primitives.
 *
 * Used by both the OpenAPI endpoint renderer and the MCP tool renderer to
 * display schema properties, field lists, and markdown descriptions with
 * consistent styling. Extracted here to avoid duplication.
 */

import { Fragment, type ReactNode } from 'react'
import { SafeMdxRenderer, type RenderNode } from 'safe-mdx'
import { parseCommonMark } from './normalize-mdx.ts'
import { Expandable } from '../components/markdown/expandable.tsx'
import { NavBadge } from '../components/layout/nav-badge.tsx'
import { HighlightedCodeBlock } from './highlight-code.tsx'
import { editorialMarkdownComponents } from './editorial-markdown-components.tsx'

/* ── Types ────────────────────────────────────────────────────────────── */

export interface SchemaInfo {
  type?: string
  format?: string
  description?: string
  required?: string[]
  properties?: Record<string, SchemaInfo>
  items?: SchemaInfo
  enum?: unknown[]
  /** Per-value descriptions from `x-enumDescriptions` / `x-enum-descriptions`. */
  enumDescriptions?: Record<string, string>
  /** Mintlify `x-mint.pre` / `x-mint.post` labels shown around the field name. */
  pills?: { pre?: string[]; post?: string[] }
  const?: unknown
  default?: unknown
  example?: unknown
  examples?: unknown[]
  oneOf?: SchemaInfo[]
  anyOf?: SchemaInfo[]
  allOf?: SchemaInfo[]
  additionalProperties?: boolean | SchemaInfo
  nullable?: boolean
  deprecated?: boolean
  readOnly?: boolean
  writeOnly?: boolean
  minimum?: number
  maximum?: number
  /** Number in OpenAPI 3.1 / JSON Schema; `true` in 3.0 (then `minimum` is the bound). */
  exclusiveMinimum?: number | boolean
  exclusiveMaximum?: number | boolean
  minLength?: number
  maxLength?: number
  minItems?: number
  maxItems?: number
  pattern?: string
  title?: string
}

/* ── Markdown descriptions ────────────────────────────────────────────── */

/**
 * Description fields in OpenAPI and MCP are Markdown by spec (headings,
 * lists, code, links, emphasis). Render them through safe-mdx with a
 * standard editorial Markdown map, without enabling nested MDX components.
 */
const descComponents = {
  ...editorialMarkdownComponents,
  pre: ({ children }: { children: ReactNode }) => <>{children}</>,
}

const renderDescNode: RenderNode = (node, transform) => {
  if (node.type === 'code') {
    const lang = node.lang ?? 'text'
    return <HighlightedCodeBlock lang={lang} bleed='none' showLineNumbers={false}>{node.value}</HighlightedCodeBlock>
  }
  if (node.type === 'heading') {
    const level = Math.min(Math.max(node.depth ?? 2, 2), 4)
    const Tag = level === 2 ? 'h2' : level === 3 ? 'h3' : 'h4'
    return <Tag className='font-semibold text-foreground'>{node.children.map((child, i) => <Fragment key={i}>{transform(child)}</Fragment>)}</Tag>
  }
  return undefined
}

/** Render a Markdown description string. Returns null for empty input. */
export function Desc({ children }: { children: string | undefined }) {
  if (!children) return null
  const markdown = children.trim()
  if (!markdown) return null
  return (
    <div className='no-bleed flex flex-col gap-(--prose-gap) text-foreground'>
      <SafeMdxRenderer
        markdown={markdown}
        mdast={parseCommonMark(markdown)}
        components={descComponents}
        renderNode={renderDescNode}
        onError={() => {}}
      />
    </div>
  )
}

/* ── Helpers ──────────────────────────────────────────────────────────── */

export function typeString(s: SchemaInfo | undefined): string {
  if (!s) return 'unknown'
  if (s.const !== undefined) return JSON.stringify(s.const)
  if (s.enum) return s.enum.map((v) => JSON.stringify(v)).join(' | ')
  const variants = unionVariants(s)
  if (variants) return variants.map((v) => v.title ?? typeString(v)).join(' | ')
  if (s.type === 'array' && s.items) {
    const item = typeString(s.items)
    return unionVariants(s.items) ? `(${item})[]` : `${item}[]`
  }
  let t = s.type ?? 'object'
  if (s.format) t += ` (${s.format})`
  if (s.nullable) t += ' | null'
  return t
}

/** Variants of a `oneOf` or `anyOf` union, or undefined when the schema is not a union. */
export function unionVariants(s: SchemaInfo): SchemaInfo[] | undefined {
  const variants = s.oneOf ?? s.anyOf
  return variants && variants.length > 0 ? variants : undefined
}

export function hasFields(s: SchemaInfo): boolean {
  return !!s.properties && Object.keys(s.properties).length > 0
}

/** True when FieldList renders named fields: own properties, or a union with an object variant. */
function hasNestedFields(s: SchemaInfo): boolean {
  return hasFields(s) || !!unionVariants(s)?.some(hasFields)
}

/** Array items whose fields should be listed under the array property. */
function nestedItems(s: SchemaInfo): SchemaInfo | undefined {
  return s.type === 'array' && s.items && hasNestedFields(s.items) ? s.items : undefined
}

export function collectTags(s: SchemaInfo): { k: string; v: string }[] {
  const tags: { k: string; v: string }[] = []
  if (s.default !== undefined) tags.push({ k: 'Default', v: JSON.stringify(s.default) })
  const example = s.example ?? s.examples?.[0]
  if (example !== undefined && typeof example !== 'object') tags.push({ k: 'Example', v: JSON.stringify(example) })
  if (s.pattern) tags.push({ k: 'Pattern', v: s.pattern })
  const exclusiveMin = typeof s.exclusiveMinimum === 'number' ? s.exclusiveMinimum : s.exclusiveMinimum ? s.minimum : undefined
  const exclusiveMax = typeof s.exclusiveMaximum === 'number' ? s.exclusiveMaximum : s.exclusiveMaximum ? s.maximum : undefined
  if (exclusiveMin !== undefined) tags.push({ k: 'Min', v: `> ${exclusiveMin}` })
  else if (s.minimum !== undefined) tags.push({ k: 'Min', v: String(s.minimum) })
  if (exclusiveMax !== undefined) tags.push({ k: 'Max', v: `< ${exclusiveMax}` })
  else if (s.maximum !== undefined) tags.push({ k: 'Max', v: String(s.maximum) })
  if (s.minLength !== undefined) tags.push({ k: 'Min length', v: String(s.minLength) })
  if (s.maxLength !== undefined) tags.push({ k: 'Max length', v: String(s.maxLength) })
  if (s.minItems !== undefined) tags.push({ k: 'Min items', v: String(s.minItems) })
  if (s.maxItems !== undefined) tags.push({ k: 'Max items', v: String(s.maxItems) })
  return tags
}

/** One line per enum value that has a description, in `enum` order. */
function EnumDescriptions({ schema }: { schema: SchemaInfo }) {
  const descriptions = schema.enumDescriptions
  if (!descriptions) return null
  const values = (schema.enum ?? Object.keys(descriptions)).filter((v) => descriptions[String(v)])
  if (values.length === 0) return null
  return (
    <div className='flex flex-col gap-1.5'>
      {values.map((v) => (
        <div key={String(v)} className='flex flex-wrap items-baseline gap-x-2'>
          <code className='font-mono code-font-size text-foreground'>{JSON.stringify(v)}</code>
          <div className='min-w-0 flex-1'><Desc>{descriptions[String(v)]}</Desc></div>
        </div>
      ))}
    </div>
  )
}

/* ── Property ─────────────────────────────────────────────────────────── */

export function canExpandSchema(schema: SchemaInfo, depth: number): boolean {
  return (hasNestedFields(schema) || !!nestedItems(schema)) && depth <= 3
}

export function Property({ name, schema, required, depth = 0, defaultOpen = false }: {
  name: string
  schema: SchemaInfo
  required?: boolean
  depth?: number
  defaultOpen?: boolean
}) {
  const items = nestedItems(schema)
  const canExpand = canExpandSchema(schema, depth)
  const childSchema = items ?? schema
  const expandTitle = !hasFields(childSchema) ? 'Show options' : items ? 'Show item properties' : 'Show properties'
  const tags = collectTags(schema)

  return (
    <div className='flex flex-col gap-3 border-b border-border-subtle py-3 first:pt-0 last:border-b-0 last:pb-0'>
      <div className='flex flex-wrap items-center gap-2'>
        {schema.pills?.pre?.map((p) => <NavBadge key={`pre-${p}`} label={p} />)}
        <span className='font-medium font-mono code-font-size text-primary'>
          {name}{required ? <span className='text-red'> *</span> : <span className='text-muted-foreground'>?</span>}
        </span>
        <span className='font-mono code-font-size text-muted-foreground'>{typeString(schema)}</span>
        {schema.deprecated && <NavBadge label='deprecated' color='yellow' />}
        {schema.readOnly && <NavBadge label='read-only' color='blue' />}
        {schema.writeOnly && <NavBadge label='write-only' color='blue' />}
        {schema.pills?.post?.map((p) => <NavBadge key={`post-${p}`} label={p} />)}
      </div>
      {schema.description && <Desc>{schema.description}</Desc>}
      <EnumDescriptions schema={schema} />
      {tags.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {tags.map((t) => (
            <span key={t.k} className='inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground'>
              <span className='font-medium'>{t.k}:</span> <code>{t.v}</code>
            </span>
          ))}
        </div>
      )}
      {canExpand && (
        <Expandable title={expandTitle} defaultOpen={defaultOpen}>
          <FieldList schema={childSchema} depth={depth + 1} />
        </Expandable>
      )}
    </div>
  )
}

/* ── Field list ───────────────────────────────────────────────────────── */

export function FieldList({ schema, depth = 0 }: { schema: SchemaInfo; depth?: number }) {
  if (hasFields(schema)) {
    const entries = Object.entries(schema.properties!)
    const firstExpandable = depth === 0
      ? entries.findIndex(([, v]) => canExpandSchema(v, depth))
      : -1
    return (
      <div className='flex flex-col'>
        {entries.map(([k, v], i) => (
          <Property
            key={k}
            name={k}
            schema={v}
            required={(schema.required ?? []).includes(k)}
            depth={depth}
            defaultOpen={i === firstExpandable}
          />
        ))}
      </div>
    )
  }
  const variants = unionVariants(schema)
  if (variants?.some(hasFields)) {
    // Property already renders its own description; only the top level (request/response body) needs it here.
    return (
      <div className='flex flex-col gap-3'>
        {depth === 0 && schema.description && <Desc>{schema.description}</Desc>}
        <div className='text-muted-foreground'>{schema.oneOf ? 'One of:' : 'Any of:'}</div>
        {variants.map((v, i) => (
          <Expandable key={i} title={v.title ?? `Option ${i + 1}`} defaultOpen={i === 0}>
            <div className='flex flex-col gap-3'>
              {v.description && <Desc>{v.description}</Desc>}
              <FieldList schema={v} depth={depth + 1} />
            </div>
          </Expandable>
        ))}
      </div>
    )
  }
  if (schema.type === 'array' && schema.items) {
    return (
      <Property
        name='items'
        schema={schema.items}
        depth={depth}
        defaultOpen={depth === 0 && canExpandSchema(schema.items, depth)}
      />
    )
  }
  if (schema.type || variants || schema.const !== undefined || schema.enum) {
    return <div className='text-muted-foreground'>Type: <code className='font-mono code-font-size'>{typeString(schema)}</code></div>
  }
  return null
}

/* ── Section ──────────────────────────────────────────────────────────── */

export function Section({ title, children }: { title: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className='flex flex-col gap-4'>
      <div className='font-semibold text-foreground'>{title}</div>
      <div className='flex flex-col'>
        {children}
      </div>
    </div>
  )
}
