const { read, write } = require('to-vfile')
const remark = require('remark')
const mdx = require('remark-mdx')


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
