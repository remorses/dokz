import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { processVirtualTabs } from '../virtual-tab-provider.ts'
import { mcpProvider } from './provider.ts'
import type { ConfigNavTab } from '../../config.ts'
import { mdxComponents, renderNode } from '../mdx-components-map.tsx'
import { SafeMdxRenderer } from 'safe-mdx'
import { mdxParse } from 'safe-mdx/parse'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import dedent from 'string-dedent'

// From ghosthand's screenshot tool. Holocron 0.36 parsed descriptions as MDX:
// `{"lease":"studio:42"}` is not a JS expression, so acorn threw and the page was a 500.
const MDX_LIKE_DESCRIPTION = dedent`
  Save the screen. Use \`wake -l <id>\` if the display is off.

  Examples (arguments):
    {"lease":"studio:42"}
    {"lease":"studio:42","native":true}
`

const DEFS = JSON.stringify({
  tools: [
    {
      name: 'analytics_languages',
      description: 'Top languages by visitors',
      inputSchema: { type: 'object', properties: {} },
    },
    {
      name: 'screenshot',
      description: MDX_LIKE_DESCRIPTION,
      inputSchema: {
        type: 'object',
        properties: { lease: { type: 'string', description: 'Lease id, e.g. {"lease":"studio:42"} or <id>' } },
      },
    },
  ],
  resources: [
    {
      name: 'issues',
      uri: 'strada://issues',
      description: 'Issue groups',
    },
  ],
}, null, 2)

let dir: string

beforeAll(() => {
  dir = fs.mkdtempSync(path.join(os.tmpdir(), 'holocron-mcp-'))
  fs.writeFileSync(path.join(dir, 'mcp-tools.json'), DEFS)
})

afterAll(() => {
  fs.rmSync(dir, { recursive: true, force: true })
})

describe('mcp provider', () => {
  test('generated tool and resource pages force default layout so compact sites keep the right aside', async () => {
    const config = {
      navigation: {
        tabs: [
          { tab: 'MCP', mcp: 'mcp-tools.json' } as ConfigNavTab,
        ],
      },
    }
    const mdxContent: Record<string, string> = {}
    await processVirtualTabs({
      config,
      projectRoot: dir,
      pagesDir: dir,
      publicDir: path.join(dir, 'public'),
      mdxContent,
      files: {},
      providers: [mcpProvider],
    })

    expect(mdxContent['mcp/analytics-languages']).toContain('mode: "default"')
    expect(mdxContent['mcp/resources/issues']).toContain('mode: "default"')
  })

  test('tool descriptions with JSON braces and <id> render as literal Markdown text', async () => {
    const mdxContent: Record<string, string> = {}
    await processVirtualTabs({
      config: { navigation: { tabs: [{ tab: 'MCP', mcp: 'mcp-tools.json' } as ConfigNavTab] } },
      projectRoot: dir,
      pagesDir: dir,
      publicDir: path.join(dir, 'public'),
      mdxContent,
      files: {},
      providers: [mcpProvider],
    })

    // Same steps as renderMdxPage: parse the page MDX, then render its nodes.
    const page = mdxContent['mcp/screenshot']!
    const mdast = mdxParse(page)
    const tool = mdast.children.filter((node) => node.type === 'mdxJsxFlowElement' && node.name === 'MCPTool')
    const errors: string[] = []
    const html = renderToStaticMarkup(
      createElement(SafeMdxRenderer, {
        markdown: page,
        mdast: { type: 'root', children: tool },
        components: mdxComponents,
        renderNode,
        onError: (error) => errors.push(error.message),
      }),
    )

    expect(errors).toEqual([])
    expect(html).toContain('wake -l &lt;id&gt;')
    expect(html).toContain('{&quot;lease&quot;:&quot;studio:42&quot;,&quot;native&quot;:true}')
    expect(html).toContain('e.g. {&quot;lease&quot;:&quot;studio:42&quot;} or &lt;id&gt;')
  })
})
