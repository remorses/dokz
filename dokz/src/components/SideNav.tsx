import { Box, BoxProps, Heading, Link, Stack } from '@chakra-ui/core'
import orderBy from 'lodash/orderBy'
import React from 'react'
import { ComponentLink } from './NavLink'
import { SidebarOrdering, useDokzConfig } from '../provider'

const MDX_EXTENSION_REGEX = /\.mdx?/

export type SideNavProps = {
    tree?: DirectoryTree
    contentHeight?: string
} & BoxProps

export const SideNav = ({ tree, ...rest }: SideNavProps) => {
    // console.log({ tree })
    const { sidebarOrdering } = useDokzConfig()
    tree = applySidebarOrdering({ tree, order: sidebarOrdering })
    return (
        <Box
            borderRightWidth='1px'
            minWidth='260px'
            height='auto'
            // overflowY='scroll'
            {...rest}
        >
            <Box
                as='nav'
                aria-label='Main navigation'
                fontSize='14px'
                fontWeight='medium'
                p='6'
            >
                <Box
                    // TODO meybe remove index in sidebar
                    my='10px'
                    fontWeight='medium'
                    letterSpacing='2px'
                    opacity={0.7}
                    mx='2'
                >
                    INDEX
                </Box>
                <NavTreeComponent {...tree} name='' />
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
    if (!order) {
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
    url = '',
    title = '',
    ...rest
}: DirectoryTree & { depth?: number }) => {
    const w = 10
    const isNavHeading = depth === 1 && children
    return (
        <Stack
            spacing='0px'
            pl={depth * w + 'px'}
            pb={depth === 1 ? '20px' : '0px'}
        >
            {name && (
                <ComponentLink
                    h='28px'
                    // display='block'
                    href={url}
                    isTruncated
                    // {...(isNavHeading ? headingStyles : {})}
                >
                    {title || name?.replace('_', ' ')?.replace(/\.mdx?/, '')}
                </ComponentLink>
            )}
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
