/**
 * Changelog virtual tab provider.
 *
 * Implements VirtualTabProvider to generate a single changelog page from a
 * GitHub repository's releases. Reads the `tab.changelog` field (a full URL
 * such as `https://github.com/owner/repo`), fetches the published releases,
 * and renders one `<Update>` entry per release.
 *
 * The generated page uses `mode: center` so the left navigation sidebar is
 * hidden, and a right-side `<Aside full>` notice explains the page is
 * generated from the GitHub releases page.
 *
 * When `tab.initialContent` is set, the virtual MDX emits an inline import
 * of the referenced file (`import _Intro from './path.mdx'`) and renders
 * `<_Intro />` above the release entries. The existing `resolveInlineImports`
 * + `remarkInlineImports` pipeline in sync.ts handles frontmatter stripping,
 * URL rewriting, and node splicing; no custom processing is needed here.
 *
 * Tests can point the fetch at a local mock server via the
 * HOLOCRON_CHANGELOG_API_URL environment variable.
 */

import fs from 'node:fs'
import path from 'node:path'
import type { ConfigNavGroup } from '../../config.ts'
import type { VirtualTabProvider, VirtualTabResult } from '../virtual-tab-provider.ts'
import { buildVirtualPageMdx, virtualPageDir } from '../virtual-page-mdx.ts'
import { commonMarkToMdx } from '../normalize-mdx.ts'
import { logger, formatHolocronWarning } from '../logger.ts'
import { parseChangelogSource } from './parse-source.ts'
import { fetchGitHubReleases, type GitHubRelease } from './github-releases.ts'

/** Try to resolve a page slug to an on-disk MDX/MD file, probing pagesDir
 *  first, then projectRoot. Returns the absolute path or undefined. */
function resolveContentFile(slug: string, pagesDir: string, projectRoot: string): string | undefined {
  // If slug already has an extension, probe it directly
  const hasExt = /\.mdx?$/.test(slug)
  for (const dir of [pagesDir, projectRoot]) {
    if (hasExt) {
      const abs = path.join(dir, slug)
      if (fs.existsSync(abs)) return abs
    } else {
      for (const ext of ['.mdx', '.md']) {
        const abs = path.join(dir, slug + ext)
        if (fs.existsSync(abs)) return abs
      }
    }
  }
  return undefined
}

export const changelogProvider: VirtualTabProvider = {
  name: 'changelog',
  claims: (tab) => !!tab.changelog,

  async generate({ tab, projectRoot, pagesDir }): Promise<VirtualTabResult> {
    const source = parseChangelogSource(tab.changelog!)
    const slug = tab.base ?? 'changelog'
    const title = tab.tab || 'Changelog'

    const result = await fetchGitHubReleases({
      owner: source.owner,
      repo: source.repo,
      baseUrl: process.env.HOLOCRON_CHANGELOG_API_URL,
    })

    // Resolve optional initialContent MDX file. Instead of reading and
    // rewriting the file ourselves, we emit an inline .mdx import in the
    // virtual MDX. The existing resolveInlineImports + remarkInlineImports
    // pipeline handles everything: frontmatter stripping, URL rewriting,
    // node splicing, and .tsx import discovery.
    let initialContentImportPath: string | undefined
    if (tab.initialContent) {
      const contentPath = resolveContentFile(tab.initialContent, pagesDir, projectRoot)
      if (contentPath) {
        const virtualDir = virtualPageDir(pagesDir, slug)
        const rel = path.relative(virtualDir, contentPath).replace(/\\/g, '/')
        initialContentImportPath = rel.startsWith('.') ? rel : './' + rel
      } else {
        logger.warn(
          formatHolocronWarning(
            `Changelog initialContent "${tab.initialContent}" not found. ` +
            `Looked in "${pagesDir}" and "${projectRoot}".`,
          ),
        )
      }
    }

    const mdx = buildChangelogMdx({
      title,
      releasesUrl: source.releasesUrl,
      releases: result.releases,
      errorHint: result.hint,
      initialContentImportPath,
    })

    const groups: ConfigNavGroup[] = [{ group: '', pages: [slug] }]
    return { groups, mdxContent: { [slug]: mdx } }
  },
}

/** Build the single changelog MDX page from the fetched releases. */
function buildChangelogMdx({
  title,
  releasesUrl,
  releases,
  errorHint,
  initialContentImportPath,
}: {
  title: string
  releasesUrl: string
  releases: GitHubRelease[] | null
  /** User-facing diagnostic hint when releases could not be loaded. */
  errorHint?: string | null
  /** Relative path to the initialContent .mdx file (e.g. './changelog-intro.mdx').
   *  When set, the virtual MDX emits a default import and renders <_ChangelogIntro />
   *  above the release entries. The inline import pipeline handles the rest. */
  initialContentImportPath?: string
}): string {
  // Right-column notice explaining the page is auto-generated.
  const aside = [
    '<Note>',
    '',
    `This changelog is generated automatically from the [GitHub releases](${releasesUrl}) page.`,
    '',
    '</Note>',
  ].join('\n')

  const bodyParts: string[] = []

  // Emit an inline .mdx import so the existing remarkInlineImports pipeline
  // handles frontmatter stripping, URL rewriting, and node splicing.
  const imports: string[] = []
  if (initialContentImportPath) {
    imports.push(`import _ChangelogIntro from '${initialContentImportPath}'`)
    bodyParts.push('<_ChangelogIntro />')
  }

  if (releases === null) {
    const detail = errorHint
      ? commonMarkToMdx(errorHint).trim()
      : 'This is usually a transient network or rate-limit issue. The changelog will appear once the releases can be fetched again.'
    bodyParts.push(
      [
        '<Warning>',
        '',
        `Could not load releases from [GitHub](${releasesUrl}).`,
        '',
        detail,
        '',
        '</Warning>',
      ].join('\n'),
    )
  } else if (releases.length === 0) {
    bodyParts.push(`No releases have been published yet. See the [releases page](${releasesUrl}).`)
  } else {
    bodyParts.push(releases.map(renderRelease).join('\n\n'))
  }

  return buildVirtualPageMdx({
    frontmatter: {
      title,
      description: `Release notes for ${title}.`,
      mode: 'center',
    },
    imports,
    aside,
    body: bodyParts.join('\n\n'),
  })
}

/** Render one release as an `<Update>` block whose children are the release
 *  body markdown. The release name renders as an H2 heading inside the block.
 *
 *  The left rail pill shows the release DATE (not the version). The version
 *  (tag_name) is the H2 heading and the stable anchor `id`, so anchors stay
 *  unique even when two releases share a date.
 *
 *  GitHub release notes are Markdown, NOT MDX. Tags, names, and bodies may
 *  contain `"`, `<`, `{`, `}`, or even `</Update>`-looking text that would
 *  break the generated MDX or escape the wrapper. JSX attributes are emitted
 *  as `={JSON.stringify(value)}` expressions, and the heading + body go
 *  through commonMarkToMdx, which escapes them outside code. */
function renderRelease(release: GitHubRelease): string {
  // The pill shows the date; fall back to the version when no date is set.
  const dateLabel = formatDate(release.publishedAt) ?? release.tagName
  const label = jsxAttr(dateLabel)
  const id = jsxAttr(release.tagName)
  const heading = commonMarkToMdx(release.name?.trim() || release.tagName).trim()

  // Blank lines around the body make MDX parse the children as blocks.
  const bodyMd = commonMarkToMdx(release.body ?? '').trim()

  return [
    `<Update id=${id} label=${label}>`,
    '',
    `## ${heading}`,
    ...(bodyMd ? ['', bodyMd] : []),
    '',
    '</Update>',
  ].join('\n')
}

/** Render a string as a JSX attribute value expression (`={"..."}`). Using a
 *  JSON-encoded expression instead of a quoted literal makes any character —
 *  quotes, braces, angle brackets — safe inside the attribute. */
function jsxAttr(value: string): string {
  return `{${JSON.stringify(value)}}`
}

/**
 * Format an ISO timestamp as a short human date (e.g. "Jan 5, 2026").
 *
 * Always formatted in UTC. GitHub's `published_at` is a UTC instant, and a
 * release published at `2026-01-05T00:00:00Z` must read "Jan 5, 2026" for
 * everyone. Formatting in the machine's local zone would shift the calendar
 * day backwards at negative UTC offsets, so the generated changelog page (and
 * its cache entry) would differ depending on which machine ran the build.
 */
function formatDate(iso: string | null): string | undefined {
  if (!iso) return undefined
  const ms = Date.parse(iso)
  if (Number.isNaN(ms)) return undefined
  return new Date(ms).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'UTC',
  })
}
