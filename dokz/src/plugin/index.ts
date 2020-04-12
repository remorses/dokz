import fs from 'fs'
import path from 'path'
import to from 'await-to-js'
import addMeta from 'remark-mdx-metadata'
import getFrontMatter from 'front-matter'
import slug from 'remark-slug'
import { generateTableOfContents } from './generateTableOfContents'
import { withMdx } from './withMdx'
import dirTree from 'directory-tree'

export function withDocz(nextConfig={}) {
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

async function getMdxFilesIndex() {
    const pagesPath = await getPagesPath()
    // console.log({ searchPath })
    const tree = dirTree(pagesPath, { extensions: /\.mdx/ }, (node: any) => {
        const pathName = node.path
        // console.log({ pathName })

        // const file = await read(pathName)
        const content = fs.readFileSync(pathName).toString()
        const frontMatter = getFrontMatter(content)
        // console.log({ frontMatter: frontMatter.attributes })
        const { title = '' } = frontMatter.attributes || ({} as any)
        const relativePath = path
            .relative(pagesPath, pathName)
            .replace('.mdx', '')
            .replace('.md', '')
            .replace('.jsx', '')
            .replace('.tsx', '')
            .replace('.js', '')
        node.title = title // TODO title is ''
        node.url = `/${relativePath}`
        // return {
        //     title,
        //     path: `/${relativePath}`,
        // }
    })

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
