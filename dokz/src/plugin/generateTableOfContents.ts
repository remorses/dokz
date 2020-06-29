import makeToc from 'mdast-util-toc'
import visit from 'unist-util-visit'
import { Node } from 'unist'
import { DokzTableOfContents } from '../types'

export function generateTableOfContents(root): DokzTableOfContents {
    const toc = makeToc(root)
    return getItems(toc?.map, { depth: 0 })
}

function getItems(node: Node & any, current) {
    if (!node) {
        return {}
    } else if (node.type === `paragraph`) {
        visit(node, (item) => {
            if (item.type === `link`) {
                current.slug = item.url
            }
            if (item.type === `text`) {
                current.title = item.value
            }
        })
        return current
    } else {
        if (node.type === `list`) {
            current.children = node.children.map((i) =>
                getItems(i, { depth: current.depth + 1 }),
            )
            return current
        } else if (node.type === `listItem`) {
            const heading = getItems(node.children[0], {
                depth: current.depth,
            })
            if (node.children.length > 1) {
                getItems(node.children[1], heading)
            }
            return heading
        }
    }
    return {}
}
