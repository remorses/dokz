/**
 * Standalone OpenAPI page generator for multi-tenant pipelines.
 *
 * Takes an OpenAPI spec as a string or parsed object and produces MDX pages
 * + navigation groups without filesystem access. Reuses the same processing
 * pipeline as the Vite plugin's openapiProvider, so the output is identical
 * to a full build.
 *
 * Usage (from Notaku or any external pipeline):
 *
 *   import { generateOpenAPIPages } from '@holocron.so/vite'
 *
 *   const { pages, navigation } = await generateOpenAPIPages({
 *     spec: yamlString,
 *     slugPrefix: 'api',
 *   })
 *   // pages: Record<string, string> — slug → MDX string
 *   // navigation: ConfigNavGroup[] — tag-grouped sidebar entries
 */

import type { ConfigNavGroup } from '../../config.ts'
import { extractOperations, processOpenAPISpec } from './process.ts'
import { createPageEmitter } from './endpoint-mdx.ts'

export interface GenerateOpenAPIPagesOptions {
  /** Raw OpenAPI spec content (YAML or JSON string), a URL, or a parsed object. */
  spec: string | object
  /** Slug prefix for generated pages (default: 'api'). */
  slugPrefix?: string
}

export interface GenerateOpenAPIPagesResult {
  /** Map of slug → MDX string for each generated endpoint page. */
  pages: Record<string, string>
  /** Navigation groups organized by tag, ready to merge into docs.json tabs. */
  navigation: ConfigNavGroup[]
  /** Static files to serve at their root-relative path, e.g. `api/openapi.json`
   *  (the formatted spec the generated pages link to). */
  files: Record<string, string>
}

/**
 * Generate MDX pages and navigation from an OpenAPI spec.
 * No filesystem access needed; works with in-memory spec content.
 */
export async function generateOpenAPIPages({
  spec,
  slugPrefix = 'api',
}: GenerateOpenAPIPagesOptions): Promise<GenerateOpenAPIPagesResult> {

  // processOpenAPISpec accepts string (path/URL) or object (parsed spec).
  // For in-memory YAML/JSON strings, parse first so @scalar/bundle skips I/O.
  let input: string | object = spec
  if (typeof spec === 'string') {
    // Try parsing as JSON; if it fails, it might be YAML.
    try {
      input = JSON.parse(spec)
    } catch {
      const { parse } = await import('yaml')
      input = parse(spec) as object
    }
  }

  const processed = await processOpenAPISpec(input)
  const operations = extractOperations(processed)

  if (operations.length === 0) {
    return { pages: {}, navigation: [], files: {} }
  }

  const pages: Record<string, string> = {}
  const specFile = slugPrefix ? `${slugPrefix}/openapi.json` : 'openapi.json'
  const emitter = createPageEmitter({
    slugPrefix,
    pages,
    where: 'generateOpenAPIPages',
    specPaths: new Map([[processed, '/' + specFile]]),
  })
  const navigation = emitter.withOverview(
    emitter.tagGroups(operations.map((op) => ({ op, doc: processed }))),
    [processed],
  )

  return { pages, navigation, files: { [specFile]: JSON.stringify(processed.bundled, null, 2) } }
}
