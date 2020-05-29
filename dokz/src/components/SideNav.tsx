import { Box, BoxProps, Heading, Link, Stack, Divider } from '@chakra-ui/core'
import orderBy from 'lodash/orderBy'
import React from 'react'
import { ComponentLink } from './NavLink'
import { SidebarOrdering, useDokzConfig } from '../provider'

const MDX_EXTENSION_REGEX = /\.mdx?/

export type SideNavProps = {
    tree?: DirectoryTree
    contentHeight?: string
} & BoxProps

function findTreeInPath(tree: DirectoryTree, path): DirectoryTree | null {
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

export const SideNav = ({ tree, ...rest }: SideNavProps) => {
    // console.log({ tree })
    const { sidebarOrdering, docsRootPath = 'pages' } = useDokzConfig()
    tree = applySidebarOrdering({ tree, order: sidebarOrdering })
    // console.log(tree)
    tree = findTreeInPath(tree, docsRootPath.replace(/^\/|\/$/g, '')) || tree
    // console.log(tree)
    if (!tree) {
        console.error(new Error(`sidenav tree is null`))
        tree = { name: '', children: [] }
    }

    return (
        <Box
            fontSize='17px'
            borderRightWidth='1px'
            minWidth='260px'
            height='auto'
            {...rest}
        >
            <Box as='nav' aria-label='Main navigation' p='6'>
                {tree.children.map((
                    x, // i map on children to exclude the `pages` or `docsRootPage` first node
                ) => (
                    <NavTreeComponent
                        hideDivider
                        key={x.path || x.title}
                        {...x}
                    />
                ))}
            </Box>
        </Box>
    )
}

export interface DirectoryTree {
    path?: string
    name: string
    children?: DirectoryTree[]
    url?: string
    title?: string
}

function equalWithoutExtension(a, b) {
    return (
        a.replace(MDX_EXTENSION_REGEX, '') ===
        b.replace(MDX_EXTENSION_REGEX, '')
    )
}

export function applySidebarOrdering({
    order,
    tree,
}: {
    tree: DirectoryTree
    order: SidebarOrdering
}): DirectoryTree {
    if (!tree.children) {
        return tree
    }
    if (!order || typeof order === 'boolean') {
        return tree
    }
    tree.children = orderBy(tree.children, (x) => {
        const index = Object.keys(order).findIndex((k) =>
            equalWithoutExtension(k, x.name),
        )
        if (index === -1) {
            return Infinity
        }
        return index
    })
    tree.children = tree.children.filter((x) => {
        const found = Object.keys(order).find((k) =>
            equalWithoutExtension(k, x.name),
        )
        if (found && order[found] === false) {
            return false
        }
        return true
    })
    tree.children.forEach((node) => {
        applySidebarOrdering({
            tree: node,
            order:
                order[node.name] ||
                order[node.name.replace(MDX_EXTENSION_REGEX, '')],
        })
    })
    return tree
}

const NavTreeComponent = ({
    name = '',
    children,
    depth = 0,
    hideDivider = false,
    url = '',
    title = '',
    ...rest
}: DirectoryTree & { depth?: number; hideDivider?: boolean }) => {
    const w = 10
    const isNavHeading = depth === 1 && children
    const formattedTitle =
        title ||
        name
            ?.replace('_', ' ')
            ?.replace('-', ' ')
            ?.replace(/\.mdx?/, '')
    return (
        <Stack
            spacing='0px'
            lineHeight='2.8em'
            // pl={depth * w + 'px'}
            // pb={depth === 1 ? '20px' : '0px'}
        >
            {name &&
                (url ? (
                    <ComponentLink
                        h='2em'
                        // display='block'
                        href={url}
                        isTruncated
                        // {...(isNavHeading ? headingStyles : {})}
                    >
                        {formattedTitle}
                    </ComponentLink>
                ) : (
                    <Box my='20px'>
                        {!hideDivider && <Divider />}
                        <Box fontWeight='semibold'>
                            {formattedTitle.toUpperCase()}
                        </Box>
                    </Box>
                ))}
            {children &&
                children.map((x) => {
                    return (
                        <NavTreeComponent
                            key={x.path || x.title}
                            {...x}
                            depth={depth + 1}
                        />
                    )
                })}
            {/* {!children && <Link href={rest.path}>{rest.title}</Link>} */}
        </Stack>
    )
}
