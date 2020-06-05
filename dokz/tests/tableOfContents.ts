import remark from 'remark'
import { generateTableOfContents } from '../src/plugin/generateTableOfContents'


function makeTableOfContents(contents: string) {
    return new Promise((resolve, rej) => {
        remark()
            .use(() => (tree, vfile) => {
                const tableOfContents = generateTableOfContents(tree)
                resolve(tableOfContents)
                return tree
            })
            .process(contents, function (err, file) {
                if (err) rej(err)
                // console.log(String(file))
            })
    })
}

describe('tableOfContents', () => {
    it('simple ', async () => {
        const data = `
# Root

## 2

## 2
        `
        const toc = await makeTableOfContents(data)
        pretty(toc)
        // assert.deepEqual(toc)
    })
    it('nested ', async () => {
        const data = `
# Root

# Root2

### 2

### 3

        `
        const toc = await makeTableOfContents(data)
        pretty(toc)
        // assert.deepEqual(toc)
    })
})

const pretty = (x) => console.log(JSON.stringify(x, null, 4))
