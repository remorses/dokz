import {
    Box,
    BoxProps,
    Heading,
    Link,
    Stack,
    Divider,
    useDisclosure,
    Collapse,
} from '@chakra-ui/react'
import orderBy from 'lodash/orderBy'
import React, { ReactNode, useEffect } from 'react'
import { ComponentLink } from './NavLink'
import {
    SidebarOrdering,
    useAnimationComponent,
    useDokzConfig,
} from '../provider'
import { Faded } from 'baby-i-am-faded'
import { useStorageState } from 'react-storage-hooks'
import { formatTitle, findTreeInPath, DirectoryTree } from './support'

const MDX_EXTENSION_REGEX = /\.mdx?/

export type SideNavProps = {
    tree?: DirectoryTree
    contentHeight?: string
} & BoxProps

export const SideNav = ({ tree, ...rest }: SideNavProps) => {
    // console.log({ tree })
    const { sidebarOrdering, docsRootPath = 'pages' } = useDokzConfig()
    tree = applySidebarOrdering({ tree, order: sidebarOrdering })
    // console.log(tree)
    tree = findTreeInPath(tree, docsRootPath) || tree
    // console.log(tree)
    if (!tree) {
        console.error(new Error(`sidenav tree is null`))
        tree = { name: '', children: [] }
    }
    const Faded = useAnimationComponent()
    return (
        <Box
            // borderRightWidth='1px'
            // minWidth='240px'
            overflowY='auto'
            as='nav'
            aria-label='Main navigation'
            py='6'
            pr='6'
            {...rest}
        >
            <Box as={Faded} cascade>
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
    order = order || {}
    if (!tree.children) {
        return tree
    }
    // put the non listed entries last
    tree.children = orderBy(tree.children, (x) => {
        const index = Object.keys(order).findIndex((k) =>
            equalWithoutExtension(k, x.name),
        )
        if (index === -1) {
            return Infinity
        }
        return index
    })
    // put the folders last
    tree.children = orderBy(tree.children, (x, i) => {
        if (x?.children?.length) {
            return Infinity
        }
        return 0
    })
    // remove entries with `false` value
    tree.children = tree.children.filter((x) => {
        const found = Object.keys(order).find((k) =>
            equalWithoutExtension(k, x.name),
        )
        if (found && order[found] === false) {
            return false
        }
        return true
    })
    // recurse
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
    path,
    ...rest
}: DirectoryTree & { depth?: number; hideDivider?: boolean }) => {
    const w = 10
    const isFolder = !url
    const formattedTitle = title || formatTitle(name || '')
    const Faded = useAnimationComponent()
    const subTree =
        children &&
        children.map((x) => {
            return (
                <NavTreeComponent
                    key={x.path || x.title}
                    {...x}
                    depth={depth + 1}
                />
            )
        })
    if (isFolder && depth > 0) {
        return (
            <CollapsableTreeNode
                path={path}
                depth={depth}
                title={formattedTitle}
                subTree={subTree}
                hideDivider={hideDivider}
                {...rest}
            />
        )
    }

    if (isFolder) {
        return (
            <Stack as={Faded} cascade spacing='0px' {...rest}>
                <Box my='0.2em'>
                    {!hideDivider && <Divider />}
                    <Box
                        py='0.2em'
                        pt='1.4em'
                        my='0.2em'
                        fontSize='1.1em'
                        fontWeight='semibold'
                    >
                        {formattedTitle}
                    </Box>
                </Box>
                {subTree}
            </Stack>
        )
    }

    return (
        <Stack spacing='0px' {...rest}>
            <ComponentLink
                opacity={0.8}
                py='0.2em'
                my='0.2em'
                href={url}
                isTruncated
            >
                {formattedTitle}
            </ComponentLink>
            {subTree}
        </Stack>
    )
}

function CollapsableTreeNode({ title, path, depth, subTree, hideDivider }) {
    const key = 'sidenav-state-' + path
    const [active, setActive] = useStorageState(
        typeof window === 'undefined' ? null : localStorage,
        key,
        '',
    )
    const { onToggle, isOpen } = useDisclosure({
        defaultIsOpen: Boolean(active),
    })
    useEffect(() => {
        setActive(isOpen ? 'true' : '')
    }, [isOpen])
    return (
        depth > 0 ? (
            <Stack spacing='0px'>
                <Box
                    display='flex'
                    alignItems='center'
                    cursor='pointer'
                    onClick={onToggle}
                    py='0.2em'
                    my='0.2em'
                >
                    <Box
                        mr='0.4em'
                        boxSize='0.6em'
                        opacity={0.6}
                        display='inline-block'
                        as={isOpen ? CollapseDown : CollapseRight}
                    />
                    {title}
                </Box>
                <Collapse in={isOpen}>
                    <Box ml='20px'>{subTree}</Box>
                </Collapse>
            </Stack>
        ) : (
            <Stack as={Faded} cascade spacing='0px'>
                <Box my='0.2em'>
                    {!hideDivider && <Divider />}
                    <Box
                        display='flex'
                        alignItems='center'
                        cursor='pointer'
                        onClick={onToggle}
                        py='0.2em'
                        my='0.2em'
                    >
                        <Box
                            mr='0.4em'
                            boxSize='0.6em'
                            opacity={0.6}
                            display='inline-block'
                            as={isOpen ? CollapseDown : CollapseRight}
                        />
                        <Box
                            fontSize='1.1em'
                            fontWeight='semibold'
                        >
                            {title}
                        </Box>
                    </Box>
                    <Collapse in={isOpen}>
                        <Box ml='20px'>{subTree}</Box>
                    </Collapse>
                </Box>
            </Stack>            
        )
    )
}

const CollapseRight = (props) => {
    return (
        <svg
            viewBox='0 0 5 8'
            fill='currentColor'
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <path
                d='M0 0.724246C0 0.111374 0.681914 -0.223425 1.13107 0.168926L4.66916 3.25957C5.11028 3.6449 5.11028 4.3551 4.66916 4.74043L1.13107 7.83107C0.681913 8.22342 0 7.88863 0 7.27575V0.724246Z'
                fill='currentColor'
            ></path>
        </svg>
    )
}

const CollapseDown = (props) => {
    return (
        <svg
            viewBox='0 0 8 6'
            fill='currentColor'
            xmlns='http://www.w3.org/2000/svg'
            {...props}
        >
            <path
                d='M7.27575 0.5C7.88863 0.5 8.22342 1.18191 7.83107 1.63107L4.74043 5.16916C4.3551 5.61028 3.6449 5.61028 3.25957 5.16916L0.168926 1.63107C-0.223425 1.18191 0.111375 0.5 0.724247 0.5L7.27575 0.5Z'
                fill='currentColor'
            ></path>
        </svg>
    )
}
