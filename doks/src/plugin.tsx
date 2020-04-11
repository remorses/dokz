import fs from 'fs'
import {Parent, Heading, Link, Paragraph, List, ListItem} from 'mdast'

// const { read, write } = require('to-vfile')
// const remark = require('remark')
// const mdx = require('remark-mdx')
import getTableOfContents, { TOCResult,  } from 'mdast-util-toc'
import { search } from './search'

const withMDX = require('@next/mdx')({
    extension: /\.mdx?$/,
    options: {
        remarkPlugins: [
            () => (tree, vfile) => {
                const toc = search(tree, )
                const { cwd, contents, history } = vfile
                const [path] = history
                
                // TODO get the file contents, extract the toc, inject it to the contents as an exported meta const
                console.log(JSON.stringify(toc, null, 4))
            },
        ],
    },
})



export function withDoks(...args) {
    return withMDX(...args)
}

// // const main = async () => {
// //     const path = './example.mdx'
// //     const file = await read(path)
// //     const contents = await remark()
// //         .use(mdx)
// //         .use(() => (tree) => {
// //             console.log(tree)
// //         })
// //         .process(file)
// //     await write({
// //         path,
// //         contents,
// //     })
// // }
