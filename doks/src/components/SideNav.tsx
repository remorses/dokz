import { Box, Heading, Link, Stack } from '@chakra-ui/core'
import treeSearch from 'tree-search'
import React, { ReactNode } from 'react'
import { ComponentLink, stringToUrl, TopNavLink } from './NavLink'
import { BoxProps } from '@chakra-ui/core'

const topNavLinks = [
    'Getting Started',
    'Principles',
    'Style Props',
    'Color Mode',
    'Responsive Styles',
    'Theme',
    'Recipes',
]

const utilsNavLinks = ['useClipboard', 'useDisclosure', 'useTheme']

const NavGroupHeading = (props) => (
    <Heading
        fontSize='xs'
        color='gray.400'
        letterSpacing='wide'
        mb={2}
        textTransform='uppercase'
        {...props}
    />
)

type NavItem = { title: string; path: string; depth?: number }

export type SideNavProps = {
    tree?: any
    contentHeight?: string
} & BoxProps

export const SideNav = ({ tree, ...rest }: SideNavProps) => {
    console.log({ tree })
    return (
        <Box
            borderRightWidth='1px'
            minWidth='260px'
            height='auto'
            overflowY='scroll'
            {...rest}
        >
            <Box
                as='nav'
                aria-label='Main navigation'
                fontSize='14px'
                fontWeight='medium'
                p='6'
            >
                <NavTreeComponent {...tree} name='' />
            </Box>
        </Box>
    )
}

const NavTreeComponent = ({
    name = '',
    children,
    depth = 0,
    url = '',
    title = '',
    ...rest
}) => {
    const w = 10
    const isNavHeading = depth === 1 && children
    return (
        <Stack
            spacing='0px'
            ml={depth * w + 'px'}
            mt={depth === 1 ? '20px' : '0px'}
        >
            {name && (
                <Link
                    h='28px'
                    // display='block'
                    href={url}
                    // {...(isNavHeading ? headingStyles : {})}
                >
                    {title || name?.replace('_', ' ')}
                </Link>
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
