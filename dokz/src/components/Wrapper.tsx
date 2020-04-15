/** @jsx jsx */
import {
    Box,
    ColorModeProvider,
    CSSReset,
    Stack,
    ThemeProvider,
    useColorMode,
    useTheme,
    theme,
} from '@chakra-ui/core'
import merge from 'lodash/fp/merge'
import { jsx } from '@emotion/core'
import { useDokzConfig } from '../provider'
import NavBar from './NavBar'
import { SideNav } from './SideNav'
import { Global, css } from '@emotion/core'
import { TableOfContents } from './TableOfContents'
import { Fragment, useMemo } from 'react'

const SIDENAV_W = 300
const TABLE_OF_C_W = 200

const NAVBAR_H = 62

const globalStyles = css`
    * {
        box-sizing: border-box;
    }
    html {
        overflow: hidden;
        height: 100%;
        scroll-behavior: smooth;
    }
    body {
        height: 100%;
        overflow: auto;
    }
`

export function PropagatedThemeProvider({ theme, children }) {
    const existingTheme = useTheme()
    // console.log({ existingTheme: existingTheme.sizes })
    const merged = useMemo(() => {
        return merge(existingTheme, theme)
    }, [theme, existingTheme])
    return <ThemeProvider theme={merged}>{children}</ThemeProvider>
}

export function Wrapper(props) {
    const { tableOfContents } = props.meta || {}
    const {
        footer,
        headerLogo,
        headerItems,
        maxPageWidth,
        bodyColor,
    } = useDokzConfig()
    const index = getMdxIndex()
    const { colorMode } = useColorMode()
    return (
        <PropagatedThemeProvider theme={theme}>
            <CSSReset />
            <Global styles={globalStyles} />
            <Stack
                align='center'
                color={bodyColor[colorMode]}
                // fontFamily='Roboto, Arial'
                // color={colorMode == 'dark' ? 'white' : black}
            >
                <Box position='relative' w='100%' maxWidth={maxPageWidth}>
                    <NavBar
                        logo={headerLogo}
                        items={headerItems}
                        tree={index}
                        height={NAVBAR_H + 'px'}
                        // maxW={PAGE_MAX_W}
                        position='fixed'
                        width='100%'
                        // mr='auto'
                        // top={0}
                        left={0}
                        right={0}
                    />
                    <SideNav
                        alignSelf='flex-start'
                        position='fixed'
                        top={NAVBAR_H}
                        // left={0}
                        tree={index}
                        height='100%'
                        width={SIDENAV_W}
                        display={['none', null, 'block']}
                        overflowY='auto'
                        overflowX='hidden'
                    />
                    <Stack
                        isInline
                        ml={['none', null, SIDENAV_W + 60]}
                        // mr={['none', null, TABLE_OF_C_W + 30 + 'px']}
                        mt={[NAVBAR_H + 'px']}
                    >
                        <Stack
                            overflow='auto'
                            fontSize='16px'
                            px={['10px', null, '20px', '40px']}
                            flex='1'
                            minW='0'
                        >
                            {props.children}
                            {footer}
                        </Stack>
                        <TableOfContents
                            position='sticky'
                            alignSelf='flex-start'
                            top={NAVBAR_H}
                            width={TABLE_OF_C_W + 'px'}
                            // right={0}
                            ml='auto'
                            height='auto'
                            display={['none', null, null, 'block']}
                            pt='40px'
                            table={tableOfContents}
                        />
                    </Stack>
                </Box>
            </Stack>
        </PropagatedThemeProvider>
    )
}

function getMdxIndex() {
    try {
        return require('nextjs_root_folder_/index.json')
    } catch {
        return {
            children: [],
        }
    }
}
