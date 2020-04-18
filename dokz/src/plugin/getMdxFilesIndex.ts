import fs from 'fs'
import path from 'path'
import to from 'await-to-js'
import addMeta from 'remark-mdx-metadata'
import getFrontMatter from 'front-matter'
import slug from 'remark-slug'
import { generateTableOfContents } from './generateTableOfContents'
import { withMdx } from './withMdx'
import dirTree from 'directory-tree'

export async function getMdxFilesIndex() {
    const pagesPath = await getPagesPath()
    // console.log({ searchPath })
    const tree = dirTree(
        pagesPath,
        { normalizePath: true, extensions: /\.mdx/ },
        (node) => {
            const pathName = node.path
            // console.log({ pathName })

            // const file = await read(pathName)
            const content = fs.readFileSync(pathName).toString()
            const frontMatter = getFrontMatter(content)
            // console.log({ frontMatter: frontMatter.attributes })
            const { name = '' } = frontMatter.attributes || ({} as any)
            const relativePath = path
                .relative(pagesPath, pathName)
                .replace('.mdx', '')
                .replace('.md', '')
                .replace('.jsx', '')
                .replace('.tsx', '')
                .replace('.js', '')
            delete node.extension
            delete node.size
            delete node.type
            // @ts-ignore
            node.title = name
            // @ts-ignore
            node.url = `/${relativePath}`
            // return {
            //     title,
            //     path: `/${relativePath}`,
            // }
        },
    )

    // the sidebar handle only the case pages is root
    if (tree.name === 'src') {
        const pagesNode = tree.children.find((x) => x.name === 'pages')
        return pagesNode
    }
    // console.log({ tree })
    return tree
}

async function getPagesPath() {
    var [err, stats] = await to(fs.promises.stat('src/pages'))
    if (!err && stats.isDirectory()) {
        return 'src/pages'
    }
    var [err, stats] = await to(fs.promises.stat('pages'))
    if (!err && stats.isDirectory()) {
        return 'pages'
    }
    throw new Error('cannot find pages directory')
}
