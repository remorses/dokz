/**
 * cURL request example generator for OpenAPI operations.
 *
 * Takes an extracted operation + its document and produces a formatted cURL
 * command with the server URL (variables filled with their defaults), auth
 * for the first security alternative, required query params, header params
 * and the request body.
 */

import type { OpenAPIV3 } from 'openapi-types'
import type { DereferencedDocument, ExtractedOperation, SecuritySchemeInfo } from './process.ts'
import { resolveSecurity, resolveServerUrl } from './process.ts'
import { sample } from '../sample.ts'

function quote(s: string): string {
  return `"${s.replace(/"/g, '\\"')}"`
}

function singleQuote(s: string): string {
  return `'${s.replace(/'/g, "'\\''")}'`
}

/** First example of an OpenAPI 3.x `examples` map (`{ name: { value } }`). */
function firstNamedExample(examples: unknown): unknown {
  if (!examples || typeof examples !== 'object') return undefined
  const first = Object.values(examples)[0]
  return first && typeof first === 'object' && 'value' in first ? (first as { value: unknown }).value : undefined
}

/** Sample value for a parameter: its examples, then schema examples/default/enum, then a placeholder. */
function sampleParam(param: OpenAPIV3.ParameterObject): string {
  if (param.example !== undefined) return String(param.example)
  const named = firstNamedExample(param.examples)
  if (named !== undefined) return String(named)
  if (param.schema && typeof param.schema === 'object') {
    const s = param.schema as OpenAPIV3.SchemaObject & { examples?: unknown[] }
    if (s.example !== undefined) return String(s.example)
    if (Array.isArray(s.examples) && s.examples.length > 0) return String(s.examples[0])
    if (s.default !== undefined) return String(s.default)
    if (s.enum && s.enum.length > 0) return String(s.enum[0])
    if (s.type === 'integer' || s.type === 'number') return '0'
    if (s.type === 'boolean') return 'true'
  }
  return `<${param.name}>`
}

/** cURL flags (and query params) that send one security scheme. */
function authParts(scheme: SecuritySchemeInfo): { flags: string[]; query: string[] } {
  if (scheme.type === 'apiKey' && scheme.paramName) {
    const name = scheme.paramName
    if (scheme.in === 'query') return { flags: [], query: [`${encodeURIComponent(name)}=<token>`] }
    if (scheme.in === 'cookie') return { flags: [`  -b ${quote(`${name}=<token>`)}`], query: [] }
    return { flags: [`  -H ${quote(`${name}: <token>`)}`], query: [] }
  }
  if (scheme.type === 'http' && scheme.scheme === 'basic') return { flags: [`  -u ${quote('<username>:<password>')}`], query: [] }
  if (scheme.type === 'http' && scheme.scheme && scheme.scheme !== 'bearer') {
    return { flags: [`  -H ${quote(`Authorization: ${scheme.scheme} <credentials>`)}`], query: [] }
  }
  // http bearer, oauth2 and openIdConnect all send a bearer token.
  return { flags: [`  -H ${quote('Authorization: Bearer <token>')}`], query: [] }
}

export function generateCurl(op: ExtractedOperation, doc: DereferencedDocument): string {
  const server = op.servers[0]
  const base = server ? resolveServerUrl(server) : 'https://api.example.com'

  let urlPath = op.path
  for (const p of op.parameters.filter((p) => p.in === 'path')) {
    urlPath = urlPath.replace(`{${p.name}}`, sampleParam(p))
  }

  const auth = resolveSecurity(op, doc).example.map(authParts)
  const queryParts = op.parameters
    .filter((p) => p.in === 'query' && p.required)
    .map((p) => `${encodeURIComponent(p.name)}=${encodeURIComponent(sampleParam(p))}`)
    .concat(auth.flatMap((a) => a.query))
  const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : ''
  const fullUrl = `${base.replace(/\/$/, '')}${urlPath}${queryString}`

  const parts: string[] = [`curl -X ${op.method.toUpperCase()} ${quote(fullUrl)}`]
  for (const p of op.parameters.filter((p) => p.in === 'header')) {
    parts.push(`  -H ${quote(`${p.name}: ${sampleParam(p)}`)}`)
  }
  parts.push(...auth.flatMap((a) => a.flags))

  const requestBody = op.operation.requestBody as OpenAPIV3.RequestBodyObject | undefined
  if (requestBody?.content) {
    const jsonContent = requestBody.content['application/json']
    if (jsonContent) {
      parts.push(`  -H ${quote('Content-Type: application/json')}`)
      const schema = jsonContent.schema as OpenAPIV3.SchemaObject | undefined
      const body = jsonContent.example ?? firstNamedExample(jsonContent.examples)
        ?? (schema ? sample(schema as Record<string, unknown>) : undefined)
      if (body !== null && body !== undefined) {
        parts.push(`  -d ${singleQuote(JSON.stringify(body, null, 2))}`)
      }
    } else {
      const [contentType, mediaObj] = Object.entries(requestBody.content)[0] ?? []
      if (contentType && mediaObj) {
        parts.push(`  -H ${quote(`Content-Type: ${contentType}`)}`)
      }
    }
  }

  return parts.join(' \\\n')
}
