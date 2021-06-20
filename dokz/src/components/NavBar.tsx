/** @jsx jsx */
import { Faded } from 'baby-i-am-faded'
import { Box, Flex, IconButton, Stack, useColorMode } from '@chakra-ui/react'
import { jsx } from '@emotion/react'
import { DiGithubBadge } from 'react-icons/di'
import { FiMoon, FiSun } from 'react-icons/fi'
import { useDokzConfig } from '../provider'
import MobileNav from './MobileNav'
import { useEffect } from 'react'
import {NavItem, NavBar as AsertoNavBar} from "@aserto/aserto-react-components";

export const GithubLink = ({ url = '', ...rest }: any) => (
    <Box
        as='a'
        href={url}
        rel='noopener noreferrer'
        target='_blank'
        aria-label="Go to Chakra UI's Github Repo"
        outline='0'
        transition='all 0.2s'
        borderRadius='md'
        _focus={{
            boxShadow: 'outline',
        }}
        {...rest}
    >
        <Box as={DiGithubBadge} boxSize='8' color='current' />
    </Box>
)

export const ColorModeSwitch = ({ ...rest }) => {
    const { colorMode, toggleColorMode } = useColorMode()
    return (
        <IconButton
            variant='ghost'
            color='current'
            // ml='2'
            fontSize='20px'
            aria-label={`Switch to ${
                colorMode === 'light' ? 'dark' : 'light'
            } mode`}
            onClick={toggleColorMode}
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            {...rest}
        />
    )
}

const NavBar = ({ logo, tree = null as any, items: navs, ...props }) => {
    useEffect(() => {
        let el = document.querySelector(`[href="${window.location.pathname}"]`)
        if (el) {
            setTimeout(() => {
                el.scrollIntoView({behavior: 'smooth', block: 'center', inline: 'center'})
            }, 900)
        }
    })
    return (
        <AsertoNavBar>
            <ul>
                {navs.map((x, i) => (
                    <NavItem key={x}>
                        {x}
                    </NavItem>
                ))}
            </ul>
        </AsertoNavBar>
    )
}

export default NavBar
