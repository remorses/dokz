export const CODE_FONT = `'Fira Code',SFMono-Regular,Menlo,Monaco,"Liberation Mono","Courier New",monospace,mono`
import { css } from '@emotion/core'

export const globalStyles = css`
    * {
        box-sizing: border-box;
    }
    html {
        overflow: hidden;
        height: 100%;
    }
    #__next {
        min-height: 100%;
    }
    body {
        height: 100%;
        overflow: auto;
        scroll-behavior: smooth;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
    }
    ul.dokz {
        list-style-type: none;
    }
    /* ol {
    list-style-type: none;
} */
`

export function getMdxSidebarTree(): DirectoryTree {
    try {
        return require('nextjs_root_folder_/sidebar.json')
    } catch {
        return {
            name: 'pages',
            children: [],
        }
    }
}

export function formatTitle(name: string) {
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

/////////// tree utils ///////////////////

export interface DirectoryTree {
    path?: string
    name: string
    children?: DirectoryTree[]
    url?: string
    title?: string
    meta?: Record<string, any>
}

export function findTreeInPath(
    tree: DirectoryTree,
    path,
): DirectoryTree | null {
    // remove leading and trailing slashes
    path = path.replace(/^\/|\/$/g, '')
    if (!tree?.children?.length) {
        return null
    }
    if (tree.path === path) {
        return tree
    }
    for (let child of tree.children) {
        let found = findTreeInPath(child, path)
        if (found) {
            return found
        }
    }
}

export function findSubtreeInPathByUrl(
    tree: DirectoryTree,
    url,
): { current?: DirectoryTree; previous?: DirectoryTree; next?: DirectoryTree } {
    if (!tree?.children?.length) {
        return null
    }
    for (let i = 0; i < tree.children.length; i++) {
        let child = tree.children[i]
        if (child.url === url) {
            return {
                previous: tree.children[i - 1],
                current: tree,
                next: tree.children[i + 1], // TODO if type is directory get the first node in folder
            }
        }
        let found = findSubtreeInPathByUrl(child, url)
        if (found) {
            return found
        }
    }
}
