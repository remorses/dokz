import App from 'next/app'
import React, { Fragment } from 'react'
import Color from 'color-js'
import {
    theme,
    CSSReset,
    Box,
    ColorModeProvider,
    CSSResetProps,
} from '@chakra-ui/core'
import { ThemeProvider } from '@chakra-ui/core'
import { MDXProvider } from '@mdx-js/react'
import MDXComponents from '../components/mdx'


const customTheme = {
    ...theme,
    colors: {
        ...theme.colors,
        globalBackground: '#E3E7EE',
        black: '#000E34',
        // blue: '#0070F3',
    },
}

const getConfig: CSSResetProps['config'] = (_, def) => {
    const { black, white, globalBackground } = customTheme.colors
    return {
        // ...def,
        light: {
            color: black,
            // bg: chroma(globalBackground).brighten(.5).css(),
            bg: undefined,
            borderColor: Color(black)
                .setAlpha(0.2)
                .toCSS(),
            placeholderColor: Color(black)
                .setAlpha(0.5)
                .toCSS(),
        },
        dark: {
            // color: white,
            // borderColor: chroma(white).alpha(.8).css(),
            // placeholderColor: chroma(white).alpha(.5).css(),
            bg: theme.colors.gray[800],
            color: theme.colors.whiteAlpha[900],
            borderColor: theme.colors.whiteAlpha[300],
            placeholderColor: theme.colors.whiteAlpha[400],
        },
    }
}

export default class MyApp extends App {

    render() {
        const { Component, pageProps } = this.props
        const { Layout = Fragment } = Component as any
        return (
            <ThemeProvider theme={customTheme as any}>
                <ColorModeProvider value='light'>
                    <CSSReset config={getConfig} />
                    <Layout>
                        <Box
                            lineHeight='normal'
                            letterSpacing='normal'
                            fontSize='16px'
                            fontWeight={400}
                        >
                            <MDXProvider components={MDXComponents}>
                                <Component {...pageProps} />
                            </MDXProvider>
                        </Box>
                        {/* <Box mt='300px' /> */}
                    </Layout>
                </ColorModeProvider>
            </ThemeProvider>
        )
    }
}
