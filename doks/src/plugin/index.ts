import fs from 'fs'
import path from 'path'
import to from 'await-to-js'
import { Parent, Heading, Link, Paragraph, List, ListItem } from 'mdast'
import addMeta from 'remark-mdx-metadata'
import getFrontMatter from 'front-matter'
import globby from 'globby'
import slug from 'remark-slug'
import { generateTableOfContents } from './generateTableOfContents'
import { withMdx } from './withMdx'

export function withDoks(...args) {
    getMdxFilesIndex()
        .then((index) => {
            return fs.promises.writeFile(
                'index.json',
                JSON.stringify(index, null, 4),
            )
        })
        .catch(console.error)
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
    })(...args)
}

async function getMdxFilesIndex() {
    const pagesPath = await getPagesPath()
    console.log({ pagesPath })
    const files = await globby(pagesPath + '/**.mdx', { onlyFiles: true })
    const promises = files.map(async (pathName) => {
        // const file = await read(pathName)
        const content = await (await fs.promises.readFile(pathName)).toString()
        const frontMatter = getFrontMatter(content)
        const { title = '' } = frontMatter.attributes || ({} as any)
        return {
            title,
            path: path.relative(pagesPath, pathName),
        }
    })
    const index = await Promise.all(promises)
    return index
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
