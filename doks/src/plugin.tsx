import fs from 'fs'
import { Parent, Heading, Link, Paragraph, List, ListItem } from 'mdast'
import addMeta from 'remark-mdx-metadata'
import getFrontMatter from 'front-matter'
import globby from 'globby'
import frontMatterPlugin from 'remark-frontmatter'

import { read, write } from 'to-vfile'
import remark from 'remark'
import mdx from 'remark-mdx'

import { search } from './search'
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
                    const tableOfContents = search(tree)
                    const { cwd, contents, history } = vfile
                    const [path] = history
                    console.log(JSON.stringify(tableOfContents, null, 4))
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

const main = async () => {
    const path = './example.mdx'
    const file = await read(path)
    const contents = await remark()
        .use(mdx)
        .use(() => (tree) => {
            console.log(tree)
        })
        .process(file)
    await write({
        path,
        contents,
    })
}
