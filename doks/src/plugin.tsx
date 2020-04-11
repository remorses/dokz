import fs from 'fs'
import { Parent, Heading, Link, Paragraph, List, ListItem } from 'mdast'
import addMeta from 'remark-mdx-metadata'
import getFrontMatter from 'front-matter'
import globby from 'globby'
import { generateTableOfContents } from './generateTableOfContents'
import { withMdx } from './withMdx'

export function withDoks(...args) {
    getMdxFilesIndex().then((index) => {
        return fs.promises
            .writeFile('index.json', JSON.stringify(index, null, 4))
            .catch(console.error)
    })
    return withMdx({
        extension: /\.mdx?$/,
        options: {
            remarkPlugins: [
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
    const files = await globby('pages/**.mdx') // TODO mdx files can also be in src
    const promises = files.map(async (pathName) => {
        // const file = await read(pathName)
        const content = await (await fs.promises.readFile(pathName)).toString()
        const frontMatter = getFrontMatter(content)
        const { title = '' } = frontMatter.attributes || ({} as any)
        return {
            title,
            path: pathName,
        }
    })
    const index = await Promise.all(promises)
    return index
}
