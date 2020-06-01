import NextLink from 'next/link'
import { DokzProvider, GithubLink, ColorModeSwitch } from 'dokz/dist'
import { useColorMode, Button as Button_, useTheme } from '@chakra-ui/core'
import React from 'react'
import { Button as Button__ } from 'landing-blocks'
import { Logo as Logo_, LogoWhite } from '../svgs'

export const Button = ({ href, ...props }: any) => {
    const { colorMode } = useColorMode()
    const theme = useTheme()
    // console.log({theme})
    // console.log({colorMode})
    return (
        <NextLink href={href}>
            <Button__ bg='primary' {...props} />
        </NextLink>
    )
}
