import { describe, expect, test, beforeAll, afterAll } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { processVirtualTabs } from '../virtual-tab-provider.ts'
import { openapiProvider } from './provider.ts'
import { generateOpenAPIPages } from './generate.ts'
import type { ConfigNavTab } from '../../config.ts'
import { mdxParse } from 'safe-mdx/parse'

const SPEC = `
openapi: "3.0.3"
info:
  title: Test API
  version: "1.0.0"
tags:
  - name: users
  - name: auth
paths:
  /auth/login:
    post:
      tags: [auth]
      summary: Login
      responses:
        "200": { description: ok }
  /users:
    get:
      tags: [users]
      summary: List users
      responses:
        "200": { description: ok }
    post:
      tags: [users]
      summary: Create user
      responses:
        "200": { description: ok }
`

let dir: string

beforeAll(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'holocron-openapi-'))
  fs.writeFileSync(path.join(dir, 'api.yaml'), SPEC)
})

afterAll(() => {
  fs.rmSync(dir, { recursive: true, force: true })
})

/** Collect every page slug (string entries) from a tab's groups, recursively,
 *  alongside the group names — a structural fingerprint for comparison. */
function fingerprint(tab: ConfigNavTab): string {
  const walkGroup = (g: { group: string; pages: unknown[] }): unknown => ({
    group: g.group,
    pages: g.pages.map((p) =>
      typeof p === 'string' ? p : walkGroup(p as { group: string; pages: unknown[] }),
    ),
  })
  return JSON.stringify(tab.groups.map((g) => walkGroup(g as any)))
}

describe('openapi provider — selective mode', () => {
  test('expands "..." and resolves endpoint refs once', async () => {
    const config = {
      navigation: {
        tabs: [
          {
            tab: 'API',
            openapi: 'api.yaml',
            groups: [
              { group: '', pages: ['intro', 'POST /auth/login', '...'] },
            ],
          } as ConfigNavTab,
        ],
      },
    }
    const mdxContent: Record<string, string> = {}
    const files: Record<string, string> = {}
    await processVirtualTabs({
      config,
      projectRoot: dir,
      pagesDir: dir,
      publicDir: path.join(dir, 'public'),
      mdxContent,
      files,
      providers: [openapiProvider],
    })

    // intro stays an MDX slug; the explicit ref + "..." become endpoint pages.
    // The "..." tag groups are hoisted to TOP-LEVEL siblings (always-visible
    // sidebar sections), not nested inside the synthetic wrapper group.
    expect(fingerprint(config.navigation.tabs[0]!)).toMatchInlineSnapshot(
      `"[{"group":"","pages":["intro","api/post-auth-login"]},{"group":"users","pages":["api/get-users","api/post-users"]}]"`,
    )
    // Virtual MDX emitted for every referenced/expanded endpoint, not for intro.
    expect(Object.keys(mdxContent).sort()).toMatchInlineSnapshot(`
      [
        "api/get-users",
        "api/post-auth-login",
        "api/post-users",
      ]
    `)
  })

  test('generated endpoint pages force default layout so compact sites keep the right aside', async () => {
    const config = {
      navigation: {
        tabs: [
          {
            tab: 'API',
            openapi: 'api.yaml',
            groups: [{ group: 'Users', pages: ['GET /users'] }],
          } as ConfigNavTab,
        ],
      },
    }
    const mdxContent: Record<string, string> = {}
    const files: Record<string, string> = {}
    await processVirtualTabs({
      config,
      projectRoot: dir,
      pagesDir: dir,
      publicDir: path.join(dir, 'public'),
      mdxContent,
      files,
      providers: [openapiProvider],
    })

    expect(mdxContent['api/get-users']).toContain('mode: "default"')
    expect(mdxContent['api/get-users']).toContain('openapiSpec: "/api/openapi.json"')
    expect(Object.keys(files)).toEqual(['api/openapi.json'])
    expect(JSON.parse(files['api/openapi.json']!).openapi).toBeTruthy()
    expect(files['api/openapi.json']).toContain('\n  "')
  })

  test('uses x-mint page metadata and content', async () => {
    const specPath = path.join(dir, 'mint.yaml')
    fs.writeFileSync(specPath, `
openapi: "3.1.0"
info: { title: Test API, version: "1.0.0" }
paths:
  /users:
    get:
      tags: [users]
      summary: Raw summary
      description: Long internal operation details.
      x-mint:
        title: Friendly endpoint
        sidebarTitle: Users
        description: Short page description.
        content: '<Badge color="blue">1 Credit</Badge>'
      responses:
        "200": { description: ok }
`)

    const config = {
      navigation: {
        tabs: [{ tab: 'API', openapi: specPath, groups: [{ group: 'Users', pages: ['GET /users'] }] } as ConfigNavTab],
      },
    }
    const mdxContent: Record<string, string> = {}
    const files: Record<string, string> = {}
    await processVirtualTabs({
      config,
      projectRoot: dir,
      pagesDir: dir,
      publicDir: path.join(dir, 'public'),
      mdxContent,
      files,
      providers: [openapiProvider],
    })

    const relevant = mdxContent['api/get-users']!
      .split('\n')
      .filter((line) => /^(title|sidebarTitle|description):|OpenAPIEndpoint|Badge/.test(line))
      .join('\n')

    expect(relevant).toMatchInlineSnapshot(`
      "title: "Friendly endpoint"
      sidebarTitle: "Users"
      description: "Short page description."
      <Badge color="blue">1 Credit</Badge>
      <OpenAPIEndpoint {...{"method":"get","path":"/users","summary":"Raw summary","parameters":[],"responses":[{"status":"200","description":"ok","examples":[]}],"security":[],"authOptional":false,"servers":[]}}>
      </OpenAPIEndpoint>"
    `)
  })

  test('uses x-holocron overrides with x-mint field fallbacks', async () => {
    const specPath = path.join(dir, 'holocron.yaml')
    fs.writeFileSync(specPath, `
openapi: "3.1.0"
info: { title: Test API, version: "1.0.0" }
paths:
  /users:
    get:
      tags: [users]
      summary: Raw summary
      description: Raw operation description.
      x-mint:
        metadata:
          title: Mint title
          sidebarTitle: Mint users
          description: Mint description.
        content: '<Badge color="blue">Mint content</Badge>'
        href: /mint/users
      x-holocron:
        title: Holocron title
        sidebarTitle: 42
        content: '<Badge color="green">Holocron content</Badge>'
        href: /reference/users
      responses:
        "200": { description: ok }
`)

    const config = {
      navigation: {
        tabs: [{ tab: 'API', openapi: specPath, groups: [] } as ConfigNavTab],
      },
    }
    const mdxContent: Record<string, string> = {}
    const files: Record<string, string> = {}
    await processVirtualTabs({
      config,
      projectRoot: dir,
      pagesDir: dir,
      publicDir: path.join(dir, 'public'),
      mdxContent,
      files,
      providers: [openapiProvider],
    })
    const standalone = await generateOpenAPIPages({ spec: fs.readFileSync(specPath, 'utf8') })

    expect({
      navigation: config.navigation.tabs[0]!.groups,
      pages: mdxContent,
    }).toEqual({
      navigation: standalone.navigation,
      pages: standalone.pages,
    })

    expect({
      pages: Object.keys(mdxContent),
      mdx: mdxContent['reference/users']
        ?.split('\n')
        .filter((line) => /^(title|sidebarTitle|description):|OpenAPIEndpoint|Badge/.test(line))
        .join('\n'),
    }).toMatchInlineSnapshot(`
      {
        "mdx": "title: "Holocron title"
      sidebarTitle: "Mint users"
      description: "Mint description."
      <Badge color="green">Holocron content</Badge>
      <OpenAPIEndpoint {...{"method":"get","path":"/users","summary":"Raw summary","parameters":[],"responses":[{"status":"200","description":"ok","examples":[]}],"security":[],"authOptional":false,"servers":[]}}>
      </OpenAPIEndpoint>",
        "pages": [
          "reference/users",
        ],
      }
    `)
  })

  test('applies x-holocron overrides in the standalone generator', async () => {
    const result = await generateOpenAPIPages({
      spec: {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              summary: 'Raw summary',
              'x-holocron': {
                metadata: { title: 'Generated users', sidebarTitle: 'Users' },
                content: '<Note>Generated content</Note>',
                href: '/reference/generated-users',
              },
              responses: { 200: { description: 'ok' } },
            },
          },
        },
      },
    })

    expect({
      navigation: result.navigation,
      pages: Object.keys(result.pages),
      mdx: result.pages['reference/generated-users']
        ?.split('\n')
        .filter((line) => /^(title|sidebarTitle):|OpenAPIEndpoint|Note/.test(line))
        .join('\n'),
    }).toMatchInlineSnapshot(`
      {
        "mdx": "title: "Generated users"
      sidebarTitle: "Users"
      <Note>Generated content</Note>
      <OpenAPIEndpoint {...{"method":"get","path":"/users","summary":"Raw summary","parameters":[],"responses":[{"status":"200","description":"ok","examples":[]}],"security":[],"authOptional":false,"servers":[]}} />",
        "navigation": [
          {
            "group": "Default",
            "pages": [
              "reference/generated-users",
            ],
          },
        ],
        "pages": [
          "reference/generated-users",
        ],
      }
    `)
  })

  test('reads servers, optional auth, tags, sidebar titles, enums and info.description from the spec', async () => {
    const result = await generateOpenAPIPages({
      spec: {
        openapi: '3.1.0',
        info: { title: 'Phone API', version: '1.0.0', description: '## Leases\n\nControl phones over {lease} routes with a <token>.' },
        servers: [{ url: '{scheme}://{host}:{port}', variables: { scheme: { default: 'http' }, host: { default: '127.0.0.1' }, port: { default: '7420' } } }],
        security: [{}, { bearerAuth: [] }],
        components: {
          securitySchemes: {
            bearerAuth: { type: 'http', scheme: 'bearer', description: 'TCP only.' },
            apiKeyAuth: { type: 'apiKey', in: 'query', name: 'key' },
          },
        },
        tags: [{ name: 'leases', 'x-group': 'Leases & locks', 'x-displayName': 'ignored' }, { name: 'api-keys', description: 'Keys' }],
        paths: {
          '/leases/{lease}': {
            get: {
              tags: ['leases'],
              summary: 'Get lease',
              'x-holocron': { metadata: { title: 'Read one lease and its holder' } },
              parameters: [{ name: 'lease', in: 'path', required: true, schema: { type: 'string', examples: ['42'] } }],
              responses: {
                200: {
                  description: 'ok',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'object',
                        properties: {
                          scale: { type: 'number', exclusiveMinimum: 0, maximum: 1, 'x-mint': { pre: ['PII'], post: ['indexed'] } },
                          step: { type: 'string', enum: ['pair', 'ready'], 'x-enumDescriptions': { pair: 'Pair from Settings', ready: 'Agents can use it' } },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
          '/keys': {
            get: { tags: ['api-keys'], summary: 'List keys', security: [{ apiKeyAuth: [] }], responses: { 200: { description: 'ok' } } },
            // Mintlify visibility: hidden keeps the page, excluded drops it.
            put: { tags: ['api-keys'], summary: 'Rotate keys', 'x-hidden': true, responses: { 200: { description: 'ok' } } },
            delete: { tags: ['api-keys'], summary: 'Purge keys', 'x-excluded': true, responses: { 200: { description: 'ok' } } },
            // Both schemes together (AND): each one is required.
            post: { tags: ['api-keys'], summary: 'Create key', security: [{ apiKeyAuth: [], bearerAuth: [] }], responses: { 200: { description: 'ok' } } },
          },
        },
      },
    })
    const mdx = result.pages['api/get-leases-lease']!
    const props = JSON.parse(mdx.match(/<OpenAPIEndpoint \{\.\.\.(.*)\} \/>/)![1]!)
    expect({
      navigation: result.navigation,
      pageSlugs: Object.keys(result.pages).sort(),
      sidebarTitle: mdx.match(/^sidebarTitle: .*$/m)?.[0],
      curl: mdx.match(/```bash title="cURL"[^\n]*\n([\s\S]*?)\n```/)![1],
      keysCurl: result.pages['api/get-keys']!.match(/```bash title="cURL"[^\n]*\n([\s\S]*?)\n```/)![1],
      security: props.security,
      andSecurity: JSON.parse(result.pages['api/post-keys']!.match(/<OpenAPIEndpoint \{\.\.\.(.*)\} \/>/)![1]!).security
        .map((s: { name: string; required: boolean }) => `${s.name} required=${s.required}`),
      authOptional: props.authOptional,
      servers: props.servers,
      fields: props.responses[0].schema.properties,
      overview: result.pages['api/overview']?.split('\n').filter((l: string) => /^(title|sidebarTitle):|Leases|Control/.test(l)),
    }).toMatchInlineSnapshot(`
      {
        "andSecurity": [
          "apiKeyAuth required=true",
          "bearerAuth required=true",
        ],
        "authOptional": true,
        "curl": "curl -X GET "http://127.0.0.1:7420/leases/42" \\
        -H "Authorization: Bearer <token>"",
        "fields": {
          "scale": {
            "exclusiveMinimum": 0,
            "maximum": 1,
            "pills": {
              "post": [
                "indexed",
              ],
              "pre": [
                "PII",
              ],
            },
            "type": "number",
          },
          "step": {
            "enum": [
              "pair",
              "ready",
            ],
            "enumDescriptions": {
              "pair": "Pair from Settings",
              "ready": "Agents can use it",
            },
            "type": "string",
          },
        },
        "keysCurl": "curl -X GET "http://127.0.0.1:7420/keys?key=<token>"",
        "navigation": [
          {
            "group": "",
            "pages": [
              "api/overview",
            ],
          },
          {
            "group": "Leases & locks",
            "pages": [
              "api/get-leases-lease",
            ],
          },
          {
            "group": "api-keys",
            "pages": [
              "api/get-keys",
              "api/post-keys",
            ],
          },
        ],
        "overview": [
          "title: "Phone API"",
          "sidebarTitle: "Overview"",
          "description: "Leases Control phones over {lease} routes with a <token>."",
          "## Leases",
          "Control phones over \\{lease} routes with a \\<token>.",
        ],
        "pageSlugs": [
          "api/get-keys",
          "api/get-leases-lease",
          "api/overview",
          "api/post-keys",
          "api/put-keys",
        ],
        "security": [
          {
            "description": "TCP only.",
            "name": "bearerAuth",
            "required": false,
            "scheme": "bearer",
            "type": "http",
          },
        ],
        "servers": [
          {
            "url": "http://127.0.0.1:7420",
          },
        ],
        "sidebarTitle": undefined,
      }
    `)
  })

  test('rejects non-route extension href values', async () => {
    await expect(generateOpenAPIPages({
      spec: {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              'x-holocron': { href: 'https://example.com/users' },
              responses: { 200: { description: 'ok' } },
            },
          },
        },
      },
    })).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: OpenAPI operation extension href must be a root-relative path without query or hash: https://example.com/users]`,
    )
  })

  test('falls back to a valid x-mint href when x-holocron href is invalid', async () => {
    const result = await generateOpenAPIPages({
      spec: {
        openapi: '3.1.0',
        info: { title: 'Test API', version: '1.0.0' },
        paths: {
          '/users': {
            get: {
              'x-mint': { href: '/mint/users' },
              'x-holocron': { href: 'https://example.com/users' },
              responses: { 200: { description: 'ok' } },
            },
          },
        },
      },
    })

    expect(Object.keys(result.pages)).toMatchInlineSnapshot(`
      [
        "mint/users",
      ]
    `)
  })

  test('"..." expands to TOP-LEVEL groups, not nested sub-groups', async () => {
    const config = {
      navigation: {
        tabs: [
          {
            tab: 'API',
            openapi: 'api.yaml',
            groups: [{ group: '', pages: ['intro', '...'] }],
          } as ConfigNavTab,
        ],
      },
    }
    const mdxContent: Record<string, string> = {}
    const files: Record<string, string> = {}
    await processVirtualTabs({
      config,
      projectRoot: dir,
      pagesDir: dir,
      publicDir: path.join(dir, 'public'),
      mdxContent,
      files,
      providers: [openapiProvider],
    })
    const groups = config.navigation.tabs[0]!.groups
    // Expect: the intro wrapper group + one top-level group per tag (auth, Users).
    expect(groups.map((g) => g.group)).toMatchInlineSnapshot(`
      [
        "",
        "auth",
        "users",
      ]
    `)
    // None of the tag groups should be nested inside the intro wrapper.
    const introGroup = groups[0]!
    expect(introGroup.pages.every((p) => typeof p === 'string')).toBe(true)
  })

  test('emits titled fences as tabs for multiple named examples', async () => {
    const SPEC_EX = `
openapi: "3.0.3"
info: { title: Ex API, version: "1.0.0" }
tags: [{ name: orders }]
paths:
  /orders:
    post:
      tags: [orders]
      summary: Create order
      requestBody:
        content:
          application/json:
            examples:
              Single item: { value: { items: [{ id: "a" }] } }
              Multiple items: { value: { items: [{ id: "a" }, { id: "b" }] } }
      responses:
        "201":
          description: created
          content:
            application/json:
              examples:
                Confirmed: { value: { id: "order-1" } }
                Empty: { value: { id: "order-2", items: [] } }
`
    const exDir = fs.mkdtempSync(path.join(os.tmpdir(), 'holocron-openapi-ex-'))
    fs.writeFileSync(path.join(exDir, 'api.yaml'), SPEC_EX)
    try {
      const config = {
        navigation: {
          tabs: [{ tab: 'API', openapi: 'api.yaml', groups: [{ group: '', pages: ['...'] }] } as ConfigNavTab],
        },
      }
      const mdxContent: Record<string, string> = {}
      const files: Record<string, string> = {}
      await processVirtualTabs({
        config,
        projectRoot: exDir,
        pagesDir: exDir,
        publicDir: path.join(exDir, 'public'),
        mdxContent,
        files: {},
        providers: [openapiProvider],
      })
      const mdx = mdxContent['api/post-orders']
      expect(mdx).toBeDefined()
      // RequestExample/ResponseExample render titled fences as tabs themselves,
      // so there is no <CodeGroup> wrapper (that would double-frame the panel).
      expect(mdx).not.toContain('<CodeGroup>')
      // The curl block is the first request tab.
      expect(mdx).toContain('title="cURL"')
      expect(mdx).toContain('title="Single item"')
      expect(mdx).toContain('title="Multiple items"')
      expect(mdx).toContain('title="Confirmed"')
      expect(mdx).toContain('title="Empty"')
      // Line numbers are disabled inside the example panels.
      expect(mdx).toContain('lines=false')
      // Both response payloads are present, not just the first.
      expect(mdx).toContain('order-1')
      expect(mdx).toContain('order-2')
    } finally {
      fs.rmSync(exDir, { recursive: true, force: true })
    }
  })

  test('renders x-codeSamples as RequestExample tabs after cURL', async () => {
    const SPEC_SDK = `
openapi: "3.0.3"
info: { title: SDK API, version: "1.0.0" }
tags: [{ name: users }]
paths:
  /users:
    get:
      tags: [users]
      summary: List users
      x-codeSamples:
        - lang: TypeScript
          label: TypeScript SDK
          source: |
            import { Acme } from '@acme/sdk'
            const client = new Acme()
            await client.users.list()
        - lang: python
          source: |
            from acme import Acme
            client = Acme()
            client.users.list()
        - lang: bash
          label: CLI
          source: acme users list
      responses:
        "200": { description: ok }
`
    const exDir = fs.mkdtempSync(path.join(os.tmpdir(), 'holocron-openapi-sdk-'))
    fs.writeFileSync(path.join(exDir, 'api.yaml'), SPEC_SDK)
    try {
      const config = {
        navigation: {
          tabs: [{ tab: 'API', openapi: 'api.yaml', groups: [{ group: '', pages: ['...'] }] } as ConfigNavTab],
        },
      }
      const mdxContent: Record<string, string> = {}
      const files: Record<string, string> = {}
      await processVirtualTabs({
        config,
        projectRoot: exDir,
        pagesDir: exDir,
        publicDir: path.join(exDir, 'public'),
        mdxContent,
        files: {},
        providers: [openapiProvider],
      })
      const mdx = mdxContent['api/get-users']
      expect(mdx).toBeDefined()
      expect(mdx).toContain('<RequestExample>')
      expect(mdx).toContain('title="cURL"')
      expect(mdx).toContain('title="TypeScript SDK"')
      expect(mdx).toContain('title="python"')
      expect(mdx).toContain('title="CLI"')
      expect(mdx).toContain('```typescript title="TypeScript SDK" lines=false')
      expect(mdx).toContain('```python title="python" lines=false')
      expect(mdx).toContain("import { Acme } from '@acme/sdk'")
      expect(mdx).toContain('from acme import Acme')
      expect(mdx).toContain('acme users list')
      // cURL tab still first: title="cURL" appears before the first SDK sample.
      const curlIdx = mdx!.indexOf('title="cURL"')
      const tsIdx = mdx!.indexOf('title="TypeScript SDK"')
      expect(curlIdx).toBeGreaterThan(-1)
      expect(tsIdx).toBeGreaterThan(curlIdx)
    } finally {
      fs.rmSync(exDir, { recursive: true, force: true })
    }
  })

  test('skips externalValue-only examples and escapes fence titles', async () => {
    const SPEC_EX = `
openapi: "3.0.3"
info: { title: Ex API, version: "1.0.0" }
tags: [{ name: orders }]
paths:
  /orders:
    post:
      tags: [orders]
      summary: Create order
      responses:
        "201":
          description: created
          content:
            application/json:
              examples:
                "weird \`name\`":
                  value: { id: "inline-1" }
                External only:
                  externalValue: "https://example.com/big.json"
`
    const exDir = fs.mkdtempSync(path.join(os.tmpdir(), 'holocron-openapi-ext-'))
    fs.writeFileSync(path.join(exDir, 'api.yaml'), SPEC_EX)
    try {
      const config = {
        navigation: {
          tabs: [{ tab: 'API', openapi: 'api.yaml', groups: [{ group: '', pages: ['...'] }] } as ConfigNavTab],
        },
      }
      const mdxContent: Record<string, string> = {}
      const files: Record<string, string> = {}
      await processVirtualTabs({
        config,
        projectRoot: exDir,
        pagesDir: exDir,
        publicDir: path.join(exDir, 'public'),
        mdxContent,
        files: {},
        providers: [openapiProvider],
      })
      const mdx = mdxContent['api/post-orders']
      expect(mdx).toBeDefined()
      // The inline example renders; backticks in the name are neutralized so
      // the fence info line stays valid.
      expect(mdx).toContain('inline-1')
      expect(mdx).toContain("title=\"weird 'name'\"")
      // The externalValue-only entry must NOT be rendered as a JSON payload.
      expect(mdx).not.toContain('externalValue')
      expect(mdx).not.toContain('big.json')
      expect(mdx).not.toContain('title="External only"')
    } finally {
      fs.rmSync(exDir, { recursive: true, force: true })
    }
  })

  test('shows all response statuses with examples, prefixed by status code', async () => {
    const SPEC_MULTI = `
openapi: "3.0.3"
info: { title: Multi API, version: "1.0.0" }
tags: [{ name: items }]
paths:
  /items:
    post:
      tags: [items]
      summary: Create item
      responses:
        "201":
          description: Created
          content:
            application/json:
              examples:
                Success A: { value: { id: "item_1", name: "A" } }
                Success B: { value: { id: "item_2", name: "B" } }
        "401":
          description: Unauthorized
          content:
            application/json:
              examples:
                No token: { value: { code: "unauthorized", message: "Missing token" } }
                Bad token: { value: { code: "unauthorized", message: "Invalid token" } }
        "204":
          description: No Content
`
    const exDir = fs.mkdtempSync(path.join(os.tmpdir(), 'holocron-openapi-multi-'))
    fs.writeFileSync(path.join(exDir, 'api.yaml'), SPEC_MULTI)
    try {
      const config = {
        navigation: {
          tabs: [{ tab: 'API', openapi: 'api.yaml', groups: [{ group: '', pages: ['...'] }] } as ConfigNavTab],
        },
      }
      const mdxContent: Record<string, string> = {}
      const files: Record<string, string> = {}
      await processVirtualTabs({
        config,
        projectRoot: exDir,
        pagesDir: exDir,
        publicDir: path.join(exDir, 'public'),
        mdxContent,
        files: {},
        providers: [openapiProvider],
      })
      const mdx = mdxContent['api/post-items']
      expect(mdx).toBeDefined()
      // Both 201 and 401 examples should be present
      expect(mdx).toContain('item_1')
      expect(mdx).toContain('item_2')
      expect(mdx).toContain('Missing token')
      expect(mdx).toContain('Invalid token')
      // Tab titles should be prefixed with status code since multiple statuses
      expect(mdx).toContain('title="201 — Success A"')
      expect(mdx).toContain('title="201 — Success B"')
      expect(mdx).toContain('title="401 — No token"')
      expect(mdx).toContain('title="401 — Bad token"')
      // 204 has no examples, so no 204 tab title in the ResponseExample
      expect(mdx).not.toContain('title="204')
    } finally {
      fs.rmSync(exDir, { recursive: true, force: true })
    }
  })

  test('single-status response examples have no status prefix', async () => {
    const SPEC_SINGLE = `
openapi: "3.0.3"
info: { title: Single API, version: "1.0.0" }
tags: [{ name: orders }]
paths:
  /orders:
    get:
      tags: [orders]
      summary: List orders
      responses:
        "200":
          description: ok
          content:
            application/json:
              examples:
                Page 1: { value: { orders: [{ id: "a" }] } }
                Empty: { value: { orders: [] } }
        "500":
          description: Internal error
`
    const exDir = fs.mkdtempSync(path.join(os.tmpdir(), 'holocron-openapi-single-'))
    fs.writeFileSync(path.join(exDir, 'api.yaml'), SPEC_SINGLE)
    try {
      const config = {
        navigation: {
          tabs: [{ tab: 'API', openapi: 'api.yaml', groups: [{ group: '', pages: ['...'] }] } as ConfigNavTab],
        },
      }
      const mdxContent: Record<string, string> = {}
      const files: Record<string, string> = {}
      await processVirtualTabs({
        config,
        projectRoot: exDir,
        pagesDir: exDir,
        publicDir: path.join(exDir, 'public'),
        mdxContent,
        files: {},
        providers: [openapiProvider],
      })
      const mdx = mdxContent['api/get-orders']
      expect(mdx).toBeDefined()
      // Only one status has examples, so no status prefix
      expect(mdx).toContain('title="Page 1"')
      expect(mdx).toContain('title="Empty"')
      expect(mdx).not.toContain('200 —')
    } finally {
      fs.rmSync(exDir, { recursive: true, force: true })
    }
  })

  test('is idempotent across re-syncs (dev-server HMR regression)', async () => {
    // The config object persists across dev-server re-syncs and the provider
    // mutates tab.groups in place. Running twice on the SAME config must yield
    // identical results — otherwise the second pass loses "..." / endpoint refs
    // and the expanded slugs end up with no virtual MDX ("MDX file not found").
    const config = {
      navigation: {
        tabs: [
          {
            tab: 'API',
            openapi: 'api.yaml',
            groups: [
              { group: '', pages: ['intro', 'POST /auth/login', '...'] },
            ],
          } as ConfigNavTab,
        ],
      },
    }

    const run = async () => {
      const mdxContent: Record<string, string> = {}
      const files: Record<string, string> = {}
      await processVirtualTabs({
        config,
        projectRoot: dir,
        pagesDir: dir,
        publicDir: path.join(dir, 'public'),
        mdxContent,
        files: {},
        providers: [openapiProvider],
      })
      return { groups: fingerprint(config.navigation.tabs[0]!), mdx: Object.keys(mdxContent).sort() }
    }

    const first = await run()
    const second = await run()
    expect(second.groups).toBe(first.groups)
    expect(second.mdx).toEqual(first.mdx)
    // And the expanded endpoint slugs must always have backing MDX content.
    expect(second.mdx).toContain('api/post-auth-login')
    expect(second.mdx).toContain('api/get-users')
  })
})

describe('openapi generated MDX', () => {
  test('spec text with braces, tags, quotes and backtick fences cannot break the page', async () => {
    const result = await generateOpenAPIPages({
      spec: {
        openapi: '3.1.0',
        info: { title: 'Say "hi" {api}', version: '1.0.0' },
        paths: {
          '/leases': {
            post: {
              summary: 'Create "lease" {x}',
              description: 'Body is {"lease":"studio:42"}; use `<id>` or <id>.\n\n</OpenAPIEndpoint>\n\n```\nfenced {raw}\n```',
              requestBody: {
                content: {
                  'application/json': {
                    examples: { 'Name "quoted"': { value: 'line\n```\nnot a fence end' } },
                  },
                },
              },
              responses: { 200: { description: 'ok {x}' } },
            },
          },
        },
      },
    })

    for (const page of Object.values(result.pages)) expect(() => mdxParse(page)).not.toThrow()
    const page = Object.values(result.pages)[0]!
    expect(page).toMatchInlineSnapshot(`
      "---
      title: "Create \\"lease\\" {x}"
      description: "Body is {\\"lease\\":\\"studio:42\\"}; use <id> or <id>. </OpenAPIEndpoint>"
      api: "POST /leases"
      openapiSpec: "/api/openapi.json"
      gridGap: 30
      mode: "default"
      ---

      <Aside full>

      <RequestExample>

      \`\`\`\`bash title="cURL" lines=false
      curl -X POST "https://api.example.com/leases" \\
        -H "Content-Type: application/json" \\
        -d '"line\\n\`\`\`\\nnot a fence end"'
      \`\`\`\`
      \`\`\`\`json title="Name \\"quoted\\"" lines=false
      line
      \`\`\`
      not a fence end
      \`\`\`\`

      </RequestExample>

      </Aside>

      <OpenAPIEndpoint {...{"method":"post","path":"/leases","summary":"Create \\"lease\\" {x}","parameters":[],"requestBody":{"contentType":"application/json","examples":[{"name":"Name \\"quoted\\"","value":"line\\n\`\`\`\\nnot a fence end"}]},"responses":[{"status":"200","description":"ok {x}","examples":[]}],"security":[],"authOptional":false,"servers":[]}}>

      Body is \\{"lease":"studio:42"}; use \`<id>\` or \\<id>.

      \\</OpenAPIEndpoint>

      \`\`\`
      fenced {raw}
      \`\`\`

      </OpenAPIEndpoint>"
    `)
  })
})
