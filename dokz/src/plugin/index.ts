import fs from 'fs'
import path from 'path'
import to from 'await-to-js'
import addMeta from 'remark-mdx-metadata'
import getFrontMatter from 'front-matter'
import slug from 'remark-slug'
import { generateTableOfContents } from './generateTableOfContents'
import { withMdx } from './withMdx'
import { getMdxFilesIndex } from './getMdxFilesIndex'
import chokidar from 'chokidar'
import { debounce } from 'debounce'

const EXTESNIONS_TO_WATCH = ['.mdx', '.md']

export function withDocz(nextConfig = {} as any) {
    const watcher = chokidar.watch('./**', {
        persistent: true,
    })
    watcher.on('add', onFileChange).on('unlink', onFileChange)
    // .on('change', writeMdxIndex)
    nextConfig.pageExtensions = unique([
        ...(nextConfig.pageExtensions || []),
        'mdx',
    ])
    return withMdx({
        extension: /\.mdx?$/,
        options: {
            remarkPlugins: [
                slug,
                () => (tree, vfile) => {
                    const tableOfContents = generateTableOfContents(tree)
                    const { cwd, contents, history } = vfile
                    // console.log(JSON.stringify(tableOfContents, null, 4))
                    addMeta({
                        // TODO add more meta like breadcrumbs, title, ...
                        meta: {
                            lastEdited: `${new Date().toISOString()}`,
                            tableOfContents,
                        },
                    })(tree)
                },
            ],
        },
    })(nextConfig)
}

function onFileChange(name) {
    const ext = path.extname(name)
    if (!EXTESNIONS_TO_WATCH.includes(ext)) {
        return
    }
    return writeMdxIndex()
}
const writeMdxIndex = debounce(
    () => {
        console.log('[ info ]  generating mdx index file')
        return getMdxFilesIndex()
            .then((index) => {
                return fs.promises.writeFile(
                    'index.json',
                    JSON.stringify(index, null, 4),
                )
            })
            .catch(console.error)
    },
    1000,
    true,
)

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
