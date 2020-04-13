import fs from 'fs'
import path from 'path'
import to from 'await-to-js'
import addMeta from 'remark-mdx-metadata'
import getFrontMatter from 'front-matter'
import slug from 'remark-slug'
import { generateTableOfContents } from './generateTableOfContents'
import { withMdx } from './withMdx'
import dirTree from 'directory-tree'
import { getMdxFilesIndex } from './getMdxFilesIndex'

export function withDocz(nextConfig={}) {
    // TODO reload every time a file changes
    getMdxFilesIndex()
        .then((index) => {
            return fs.promises.writeFile(
                'index.json',
                JSON.stringify(index, null, 4),
            )
        })
        .catch(console.error)
    // nextConfig.pageExtensions = [
    //     // ...(nextConfig.pageExtensions || []),
    //     'js',
    //     'jsx',
    //     'md',
    //     'mdx',
    //     'tsx',
    // ]
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
