import { DoczProvider, GithubLink, ColorModeSwitch } from 'dokz/dist'
import { useColorMode } from '@chakra-ui/core'
import React from 'react'
import { Logo as Logo_, LogoWhite } from '../svgs'

export const Logo = (props) => {
    const { colorMode } = useColorMode()
    return colorMode === 'light' ? (
        <Logo_ {...props} />
    ) : (
        <LogoWhite {...props} />
    )
}
