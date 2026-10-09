/**
 * OpenAPI virtual tab provider.
 *
 * Implements VirtualTabProvider to generate navigation groups and virtual
 * MDX pages from OpenAPI specs. Reads the `tab.openapi` field (string or
 * string[]), processes each spec through the @scalar pipeline, and produces
 * one virtual page per endpoint grouped by tag.
 */

import fs from 'node:fs'
import path from 'node:path'
import type { ConfigNavGroup, ConfigNavPageEntry } from '../../config.ts'
import type { VirtualTabProvider, VirtualTabResult } from '../virtual-tab-provider.ts'
import type { DereferencedDocument } from './process.ts'
import { extractOperations, processOpenAPISpec } from './process.ts'
import { parseEndpointRef, endpointKey } from './endpoint-ref.ts'
import { createPageEmitter, type OpWithDoc } from './endpoint-mdx.ts'

/** Internal marker spliced in place of the author's `"..."` entry during the
 *  first pass, then replaced with auto-generated tag groups in the second pass.
 *  A unique frozen object so it is compared by reference (`p === REST_PLACEHOLDER`)
 *  and can never collide with a real, value-equal page entry. It is a valid
 *  `ConfigNavGroup` shape only so it type-checks inside the entries array; it is
 *  always removed before the result is returned. */
const REST_PLACEHOLDER: ConfigNavGroup = Object.freeze({ group: '', pages: [] })

export const openapiProvider: VirtualTabProvider = {
  name: 'openapi',
  claims: (tab) => !!tab.openapi,

  async generate({ tab, projectRoot, pagesDir }): Promise<VirtualTabResult> {
    const specPathsInput = Array.isArray(tab.openapi) ? tab.openapi! : [tab.openapi!]
    const slugPrefix = tab.base ?? 'api'
    const mdxContent: Record<string, string> = {}
    const watchPaths: string[] = []
    const files: Record<string, string> = {}
    // Root-relative URL path each spec is served at, keyed by processed doc.
    const specPaths = new Map<DereferencedDocument, string>()

    const allOps: OpWithDoc[] = []
    const docs: DereferencedDocument[] = []
    // Per-spec lookup so the `specfile METHOD /path` form can target a spec.
    const opsBySpecFile = new Map<string, Map<string, OpWithDoc>>()


    for (const specPath of specPathsInput) {
      // Probe pagesDir first (handles pagesDir: './src' with spec inside src/),
      // fall back to projectRoot. Same resolution strategy as MDX imports.
      const inPagesDir = path.resolve(pagesDir, specPath)
      const inRoot = path.resolve(projectRoot, specPath)
      const resolvedPath = fs.existsSync(inPagesDir) ? inPagesDir
        : fs.existsSync(inRoot) ? inRoot
        : null
      if (!resolvedPath) {
        const locations = pagesDir !== projectRoot
          ? `\n  - ${inPagesDir}\n  - ${inRoot}`
          : `\n  - ${inRoot}`
        throw new Error(`[holocron] OpenAPI spec not found:${locations}`)
      }
      watchPaths.push(resolvedPath)

      const processed = await processOpenAPISpec(resolvedPath)
      docs.push(processed)
      const stem = specPathsInput.length === 1
        ? 'openapi'
        : `openapi-${path.basename(specPath, path.extname(specPath))}`
      const prefix = slugPrefix ? `${slugPrefix}/` : ''
      let filePath = `${prefix}${stem}.json`
      for (let n = 2; filePath in files; n++) filePath = `${prefix}${stem}-${n}.json`
      files[filePath] = JSON.stringify(processed.bundled, null, 2)
      specPaths.set(processed, '/' + filePath)
      const specMap = new Map<string, OpWithDoc>()
      for (const op of extractOperations(processed)) {
        const item = { op, doc: processed }
        allOps.push(item)
        specMap.set(endpointKey(op.method, op.path), item)
      }
      opsBySpecFile.set(specPath, specMap)
    }

    // Spec has no operations. In selective mode the tab may still carry
    // hand-written MDX groups, so preserve them; in dedicated mode there is
    // nothing to generate.
    if (allOps.length === 0) return { groups: tab.groups, mdxContent, files, watchPaths }


    const { emitEndpoint, tagGroups, withOverview } = createPageEmitter({
      slugPrefix,
      pages: mdxContent,
      where: `tab "${tab.tab}"`,
      specPaths,
    })
    // Disk-shadow detection (a slug shadowing a real MDX file) is centralized
    // in processVirtualTabs() so every provider gets it.

    /** Look up an operation by an endpoint ref string, honoring an optional
     *  spec-file selector. Throws a helpful error if it cannot be resolved. */
    const resolveEndpointRef = (entry: string): OpWithDoc | undefined => {
      const ref = parseEndpointRef(entry)
      if (!ref) return undefined

      const key = endpointKey(ref.method, ref.path)
      let item: OpWithDoc | undefined
      if (ref.specFile) {
        const specMap = opsBySpecFile.get(ref.specFile)
        if (!specMap) {
          throw new Error(
            `[holocron] OpenAPI page "${entry}" in tab "${tab.tab}" references spec ` +
            `"${ref.specFile}", which is not listed in the tab's openapi field.`,
          )
        }
        item = specMap.get(key)
      } else {
        // No spec selector: search every spec. If more than one spec defines
        // the same METHOD /path the reference is ambiguous — error and tell the
        // author to disambiguate with the `specfile METHOD /path` form.
        const matches: { specFile: string; item: OpWithDoc }[] = []
        for (const [specFile, specMap] of opsBySpecFile) {
          const found = specMap.get(key)
          if (found) matches.push({ specFile, item: found })
        }
        if (matches.length > 1) {
          throw new Error(
            `[holocron] OpenAPI page "${entry}" in tab "${tab.tab}" is ambiguous: ` +
            `${ref.method.toUpperCase()} ${ref.path} exists in multiple specs ` +
            `(${matches.map((m) => `"${m.specFile}"`).join(', ')}). ` +
            `Disambiguate with the "specfile ${ref.method.toUpperCase()} ${ref.path}" form.`,
          )
        }
        item = matches[0]?.item
      }

      if (!item) {
        throw new Error(
          `[holocron] OpenAPI page "${entry}" in tab "${tab.tab}" does not match any ` +
          `${ref.method.toUpperCase()} ${ref.path} operation in the spec.`,
        )
      }
      return item
    }

    // ── Selective mode: user authored groups/pages with endpoint refs ─────
    if (tab.groups.length > 0) {
      // Track which operations the author referenced explicitly, so the "..."
      // sentinel can expand only the *remaining* (unlisted) endpoints.
      const referenced = new Set<OpWithDoc>()
      let sawRest = false

      // Maps one authored entry to zero-or-more resolved entries. Returns an
      // array because the "..." sentinel expands into multiple tag groups.
      const mapPageEntry = (entry: ConfigNavPageEntry): ConfigNavPageEntry[] => {
        if (typeof entry !== 'string') {
          return [{ ...entry, pages: entry.pages.flatMap(mapPageEntry) }]
        }
        if (entry === '...') {
          if (sawRest) {
            throw new Error(
              `[holocron] tab "${tab.tab}" has more than one "..." entry. ` +
              `Only one rest-expansion is allowed per OpenAPI tab.`,
            )
          }
          sawRest = true
          // Resolve lazily below once every other entry has been visited.
          return [REST_PLACEHOLDER]
        }
        const item = resolveEndpointRef(entry)
        if (!item) return [entry] // normal MDX slug, untouched
        referenced.add(item)
        return [emitEndpoint(item)]
      }

      // First pass: resolve everything except "...", recording referenced ops.
      const groups: ConfigNavGroup[] = tab.groups.map((g) => ({
        ...g,
        pages: g.pages.flatMap(mapPageEntry),
      }))

      // Second pass: replace the "..." placeholder (if any) with tag groups
      // for all operations the author did not list explicitly.
      if (sawRest) {
        const rest = allOps.filter((item) => !referenced.has(item))
        const restGroups = tagGroups(rest)

        // The expanded tag groups must become TOP-LEVEL tab groups so they
        // render as always-visible sidebar sections (like dedicated mode),
        // not collapsed sub-groups nested inside a wrapper group. We therefore
        // hoist at the tab.groups level: a top-level group containing the
        // placeholder is split into [leading entries] + restGroups + [trailing
        // entries], where the leading/trailing slices keep the author's group
        // (so an explicitly named group is preserved). A placeholder nested
        // deeper than the top level stays in place (the author asked for it
        // inside that sub-group).
        const containsPlaceholderShallow = (pages: ConfigNavPageEntry[]): boolean =>
          pages.some((p) => p === REST_PLACEHOLDER)

        // Splice a placeholder that is nested below the top level (rare): keep
        // it as inline group entries within its parent's pages.
        const spliceNested = (pages: ConfigNavPageEntry[]): ConfigNavPageEntry[] =>
          pages.flatMap((p): ConfigNavPageEntry[] => {
            if (p === REST_PLACEHOLDER) return restGroups
            if (typeof p !== 'string') return [{ ...p, pages: spliceNested(p.pages) }]
            return [p]
          })

        const hoisted: ConfigNavGroup[] = []
        for (const g of groups) {
          if (!containsPlaceholderShallow(g.pages)) {
            // No top-level placeholder here, but it might be nested deeper.
            hoisted.push({ ...g, pages: spliceNested(g.pages) })
            continue
          }
          // Split this group's pages at the placeholder, hoisting restGroups to
          // top level between the leading and trailing slices.
          const idx = g.pages.findIndex((p) => p === REST_PLACEHOLDER)
          const before = g.pages.slice(0, idx).map(spliceNestedEntry)
          const after = g.pages.slice(idx + 1).map(spliceNestedEntry)
          if (before.length > 0) hoisted.push({ ...g, pages: before })
          hoisted.push(...restGroups)
          if (after.length > 0) hoisted.push({ ...g, pages: after })
        }

        function spliceNestedEntry(p: ConfigNavPageEntry): ConfigNavPageEntry {
          if (typeof p !== 'string') return { ...p, pages: spliceNested(p.pages) }
          return p
        }

        return { groups: hoisted, mdxContent, files, watchPaths }
      }

      return { groups, mdxContent, files, watchPaths }
    }

    // ── Dedicated mode: auto-group every endpoint by its first tag ────────
    // The first spec's info.description becomes an Overview page on top.
    // Selective mode skips it: the author writes their own intro pages.
    return { groups: withOverview(tagGroups(allOps), docs), mdxContent, files, watchPaths }
  },
}
