import flatten from 'lodash/flatten'
import nodeToString from 'hast-util-to-string'
import { formatter } from './utils/format'
import { componentName, sanitizeCode, removeTags } from './utils/jsx'
import { getImportsVariables } from './utils/imports'
import { getExportsVariables } from './utils/exports'

const isPlayground = (name: string) => {
    return name === 'Playground'
}

const addComponentsProps = (scopes: string[]) => (node: any, idx: number) => {
    const name = componentName(node.value)
    const tagOpen = new RegExp(`^\\<${name}`)
    const formatted = formatter(nodeToString(node))
    const code = formatted.slice(1, Infinity)
    const scope = `{props, ${scopes.join(',')}}`
    const child = sanitizeCode(removeTags(code))
    const newTag = `<${name} __position={${idx}} code={'${child}'} scope={${scope}}`
    // console.log(newTag)
    node.value = node.value.replace(tagOpen, newTag)
}

export interface PluginOpts {
    root: string
}

export const playgroundRegex = /<Playground\b/

export const injectCodeToPlayground = () => (
    tree: any,
    file: { contents: string },
) => {
    if (file.contents.search(playgroundRegex) == -1) {
        return tree
    }

    const playgroundComponents: Node[] = tree.children
        .filter((node: any) => node.type === 'jsx')
        .filter((node) => {
            const name = componentName(node.value)
            return isPlayground(name)
        })

    const importNodes = tree.children.filter((n: any) => n.type === 'import')
    const exportNodes = tree.children.filter((n: any) => n.type === 'export')
    const importedScopes = flatten<string>(importNodes.map(getImportsVariables))
    const exportedScopes = flatten<string>(exportNodes.map(getExportsVariables)) // TODO exports not working, migrate to es lexer
    // filter added to avoid throwing if an unexpected type is exported
    const scopes: string[] = [...importedScopes, ...exportedScopes].filter(
        Boolean,
    )
    playgroundComponents.forEach(addComponentsProps(scopes))

    return tree
}
