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

const EXTENSIONS_TO_WATCH = ['.mdx', '.md']
const EDIT_THIS_PAGE_GUIDE = 'https://dokz.site/docs/edit-this-page'

export function withDokz(nextConfig = {} as any) {
    checkBabelConfig()
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
                    const { cwd, contents, history, data } = vfile
                    if (process.env.DEBUG) {
                        console.log('frontmatter', data)
                    }
                    const plugin = pipe(
                        addMeta({
                            meta: {
                                // lastEdited: `${new Date().toISOString()}`,
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

async function checkBabelConfig() {
    const babelConfigPath = [
        '.babelrc',
        '.babelrc.json',
        'babel.config.js',
        'babel.config.json',
    ]
        .map((p) => fs.existsSync(p) && p)
        .find(Boolean)
    if (
        !babelConfigPath ||
        (await fs.promises.readFile(babelConfigPath))
            .toString()
            .search('edit-this-page') === -1
    ) {
        console.log(
            chalk.yellow(
                `\nYou have not yet configured 'edit-this-page' feature\nFollow the guide at '${EDIT_THIS_PAGE_GUIDE}' to see how\n`,
            ),
        )
    }
}
