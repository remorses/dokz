import { DoczProvider, GithubLink, ColorModeSwitch } from 'dokz/dist'
import { useColorMode } from '@chakra-ui/core'
import React from 'react'
import NextLink from 'next/link'
import { Logo as Logo_, LogoWhite } from '../svgs'

export const Logo = (props) => {
    const { colorMode } = useColorMode()
    return (
        <NextLink href='/'>
            <a>
                {colorMode === 'light' ? (
                    <Logo_ {...props} />
                ) : (
                    <LogoWhite {...props} />
                )}
            </a>
        </NextLink>
    )
}
