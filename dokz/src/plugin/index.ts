import chokidar from 'chokidar'
import throttle from 'lodash/throttle'
import fs from 'fs'
import { pipe } from 'lodash/fp'
import path from 'path'
import chalk from 'chalk'
import extractFrontmatter from 'remark-extract-frontmatter'
import frontmatter from 'remark-frontmatter'
import addMeta from 'remark-mdx-metadata'
import slug from 'remark-slug'
import YAML from 'yaml'
import { generateTableOfContents } from './generateTableOfContents'
import { getMdxFilesIndex } from './getMdxFilesIndex'
import { injectCodeToPlayground } from './rehype/playground'
import { withMdx } from './withMdx'
import { formatTitle } from '../components/support'

const EXTENSIONS_TO_WATCH = ['.mdx', '.md']

export function withDokz(nextConfig = {} as any) {
    // .on('change', writeMdxIndex)
    nextConfig.pageExtensions = unique([
        ...(nextConfig.pageExtensions || []),
        'mdx',
    ])

    return withMdx({
        extension: /\.mdx?$/,
        onStart: (_, options) => {
            // only run once
            if (options.isServer) {
                return
            }
            writeMdxIndex()
            if (process.env.NODE_ENV !== 'production') {
                const watcher = chokidar.watch(['./**/*.mdx', './**/*.md'], {
                    persistent: true,
                    ignoreInitial: true,
                })
                watcher.on('change', onFileChange)
                watcher.on('add', onFileChange)
                watcher.on('unlink', onFileChange)
            } else {
                writeMdxIndex()
            }
        },
        options: {
            remarkPlugins: [
                frontmatter,
                [extractFrontmatter, { yaml: YAML.parse }],
                slug,
                () => (tree, vfile) => {
                    const tableOfContents = generateTableOfContents(tree)
                    // console.log(vfile)
                    const { cwd, contents, history = [], data } = vfile
                    const filePath: string = history[0] || ''
                    if (process.env.DEBUG) {
                        console.log('frontmatter', data)
                    }
                    const plugin = pipe(
                        addMeta({
                            meta: {
                                // lastEdited: `${new Date().toISOString()}`,
                                name: formatTitle(
                                    filePath.split('/').slice(-1)[0] || '',
                                ),
                                ...data,
                                tableOfContents,
                            },
                        }),
                    )
                    plugin(tree)
                },
            ],
            rehypePlugins: [injectCodeToPlayground],
        },
    })(nextConfig)
}

function onFileChange(name) {
    const ext = path.extname(name)
    if (!EXTENSIONS_TO_WATCH.includes(ext)) {
        return
    }
    writeMdxIndex()
}

const writeMdxIndex = throttle(() => {
    console.log('[ info ]  generating mdx sidebar file')
    return getMdxFilesIndex()
        .then((index) => {
            return fs.promises.writeFile(
                'sidebar.json',
                JSON.stringify(index, null, 4),
            )
        })
        .catch((e) => {
            console.error('could not write mdx sidebar file')
            console.error(e)
        })
}, 2000)

function unique(arr) {
    var u = {},
        a = []
    for (var i = 0, l = arr.length; i < l; ++i) {
        if (!u.hasOwnProperty(arr[i])) {
            a.push(arr[i])
            u[arr[i]] = 1
        }
    }
    return a
}
