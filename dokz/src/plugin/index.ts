import chokidar from 'chokidar'
import { debounce } from 'debounce'
import fs from 'fs'
import path from 'path'
import addMeta from 'remark-mdx-metadata'
import slug from 'remark-slug'
import { generateTableOfContents } from './generateTableOfContents'
import { getMdxFilesIndex } from './getMdxFilesIndex'
import { injectCodeToPlayground } from './rehype/playground'
import { withMdx } from './withMdx'

const EXTESNIONS_TO_WATCH = ['.mdx', '.md']

export function withDokz(nextConfig = {} as any) {
    if (process.env.NODE_ENV !== 'production') {
        const watcher = chokidar.watch('./**', {
            persistent: true,
        })
        watcher.on('add', onFileChange).on('unlink', onFileChange)
    } else {
        writeMdxIndex()
    }
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
            rehypePlugins: [injectCodeToPlayground],
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
