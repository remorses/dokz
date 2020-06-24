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

export function getMdxSidebarTree() {
    try {
        return require('nextjs_root_folder_/sidebar.json')
    } catch {
        return {
            children: [],
        }
    }
}
