import myToString from 'mdast-util-to-string'
import visit from 'unist-util-visit'
import convert from 'unist-util-is/convert'
import slugs_ from 'github-slugger'
const slugs = slugs_()
// import toExpression from './to-expression'

var heading = convert('heading')

const defaultSettings = {
    maxDepth: 6,
    parents: undefined,
}

export type DoksTableOfContents = {
    index: number
    endIndex: number
    map: {
        depth: number
        children: {
            type: 'text'
            value: string
            id: string
            depth: number
            position: any
        }[]
    }[]
}

// Search a node for a location.
export function generateTableOfContents(root, expression = null, settings = defaultSettings) {
    var length = root.children.length
    var depth = null
    var lookingForToc = expression !== null
    var maxDepth = settings.maxDepth || 6
    var skip = null // settings.skip ? toExpression(settings.skip) : null
    var parents = convert(settings.parents || root)
    var map = []
    var headingIndex
    var closingIndex

    if (!lookingForToc) {
        headingIndex = -1
    }

    slugs.reset()

    // Visit all headings in `root`.  We `slug` all headings (to account for
    // duplicates), but only create a TOC from top-level headings.
    visit(root, 'heading', onheading)

    if (headingIndex && !closingIndex) {
        closingIndex = length + 1
    }

    if (headingIndex === undefined) {
        headingIndex = -1
        closingIndex = -1
        map = []
    }

    return { index: headingIndex, endIndex: closingIndex, map: map }

    function onheading(child, index, parent) {
        var value = myToString(child)
        var id =
            child.data && child.data.hProperties && child.data.hProperties.id
        var slug = slugs.slug(id || value)

        if (!parents(parent)) {
            return
        }

        if (lookingForToc) {
            if (isClosingHeading(child, depth)) {
                closingIndex = index
                lookingForToc = false
            }

            if (isOpeningHeading(child, depth, expression)) {
                headingIndex = index + 1
                depth = child.depth
            }
        }

        if (
            !lookingForToc &&
            value &&
            child.depth <= maxDepth &&
            (!skip || !skip.test(value))
        ) {
            map.push({
                depth: child.depth,
                children: child.children,
                id: slug,
            })
        }
    }
}

// Check if `node` is the main heading.
function isOpeningHeading(node, depth, expression) {
    return depth === null && heading(node) && expression.test(myToString(node))
}

// Check if `node` is the next heading.
function isClosingHeading(node, depth) {
    return depth && heading(node) && node.depth <= depth
}
