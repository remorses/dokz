import { Box, Heading } from '@chakra-ui/core'
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

export type SideNavProps = {
    items?: ReactNode[]
    contentHeight?: string
} & BoxProps

export const SideNav = ({
    items,
    contentHeight = 'calc(100vh - 4rem)',
    ...rest
}: SideNavProps) => {
    return (
        <Box
            // position='fixed'
            // left='0'
            // width='100%'
            height='100%'
            {...rest}
        >
            <Box position='relative' overflowY='auto' borderRightWidth='1px'>
                <Box
                    as='nav'
                    height={contentHeight}
                    aria-label='Main navigation'
                    fontSize='sm'
                    p='6'
                >
                    <Box mb='8'>
                        {topNavLinks.map((link) => (
                            <TopNavLink key={link} href={stringToUrl(link)}>
                                {link}
                            </TopNavLink>
                        ))}
                    </Box>

                    <Box mb='10'>
                        <NavGroupHeading>Components</NavGroupHeading>
                        {items.map((link) => (
                            <ComponentLink key={link.toString()} href={stringToUrl(link)}>
                                {link}
                            </ComponentLink>
                        ))}
                    </Box>

                    <Box mb='10'>
                        <NavGroupHeading>Utilities</NavGroupHeading>
                        {utilsNavLinks.map((link) => (
                            <ComponentLink key={link} href={stringToUrl(link)}>
                                {link}
                            </ComponentLink>
                        ))}
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

export default SideNav
