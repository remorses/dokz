import to from 'await-to-js'
import dirTree from 'directory-tree'
import getFrontMatter from 'front-matter'
import fs from 'fs'
import path from 'path'

export async function getMdxFilesIndex() {
    const pagesPath = await getPagesPath()
    // console.log({ searchPath })
    const tree = dirTree(
        pagesPath,
        { normalizePath: true, extensions: /\.mdx?/ },
        (node: dirTree.DirectoryTree & { url; meta; title }) => {
            const pathName = node.path
            const content = fs.readFileSync(pathName).toString()
            const { attributes = {} as any } = getFrontMatter(content)
            // console.log({ frontMatter: frontMatter.attributes })
            const { name = '', ...meta } = attributes
            node.meta = meta || {}
            node.title = name || formatTitle(node.name || '')
            node.url = formatRelativePath(path.relative(pagesPath, pathName))
            delete node.extension
            delete node.size
            delete node.type
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

function formatRelativePath(path) {
    // console.log(path)
    let relativePath = path
        .replace('.mdx', '')
        .replace('.md', '')
        .replace('.jsx', '')
        .replace('.tsx', '')
        .replace('.js', '')
        .replace(/\bindex$/, '')

    return '/' + (relativePath || '')
}

function formatTitle(name: string) {
    return capitalizeFirstLetter(
        name
            .replace(/_/g, ' ')
            .replace(/-/g, ' ')
            .replace(/\.mdx?/, ''),
    )
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
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
