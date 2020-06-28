/** @jsx jsx */
import {
    Box,
    ColorModeProvider,
    CSSReset,
    ThemeProvider,
    useColorMode,
    useTheme,
    theme,
} from '@chakra-ui/core'
import { Stack, Flex } from 'layout-kit-react'
import merge from 'lodash/fp/merge'
import { jsx } from '@emotion/core'
import { useDokzConfig } from '../provider'
import NavBar from './NavBar'
import { SideNav } from './SideNav'
import { Global, css } from '@emotion/core'
import { TableOfContents } from './TableOfContents'
import { Fragment, useMemo } from 'react'
import { globalStyles, getMdxSidebarTree } from './support'
import { FooterButtons } from './FooterButtons'

const SIDENAV_W = 280
const TABLE_OF_C_W = 200

const NAVBAR_H = 62

export function Wrapper(props) {
    const { tableOfContents } = props.meta || {}
    const {
        footer,
        headerLogo,
        headerItems,
        maxPageWidth,
        bodyColor,
        fontSize,
        fontWeight,
        fontFamily,
    } = useDokzConfig()
    const index = getMdxSidebarTree()
    const { colorMode } = useColorMode()
    return (
        <PropagatedThemeProvider theme={theme}>
            <CSSReset />
            <Global styles={globalStyles} />
            <Stack
                align='center'
                color={bodyColor[colorMode]}
                fontSize={fontSize}
                fontFamily={fontFamily}
                fontWeight={fontWeight}
                // color={colorMode == 'dark' ? 'white' : black}
            >
                <Box position='relative' w='100%' maxWidth={maxPageWidth}>
                    <NavBar
                        // px='4'
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
                        bottom={0}
                        fontSize='0.9em'
                        // fontWeight='500'
                        // left={0}
                        tree={index}
                        // height='100%'
                        width={SIDENAV_W}
                        display={['none', null, 'block']}
                        overflowY='auto'
                        overflowX='hidden'
                    />
                    <Stack
                        direction='row'
                        align='stretch'
                        ml={['none', null, SIDENAV_W]}
                        // mr={['none', null, TABLE_OF_C_W + 30 + 'px']}
                        mt={[NAVBAR_H + 'px']}
                    >
                        <Flex
                            direction='column'
                            align='stretch'
                            overflow='auto'
                            px={['10px', null, '20px', '30px']}
                            // spacing='10px'
                            flex='1'
                            minW='0'
                            borderRightWidth='1px'
                            borderLeftWidth='1px'
                        >
                            {props.children}
                            <FooterButtons my='20' width='100%' />
                            {footer}
                        </Flex>
                        <TableOfContents
                            fontSize='0.9em'
                            // fontWeight='400'
                            position='sticky'
                            alignSelf='flex-start'
                            top={NAVBAR_H}
                            width={TABLE_OF_C_W + 'px'}
                            // right={0}
                            ml='auto'
                            height='auto'
                            display={['none', null, null, null, 'block']}
                            pt='20px'
                            opacity={0.8}
                            table={tableOfContents}
                        />
                    </Stack>
                </Box>
            </Stack>
        </PropagatedThemeProvider>
    )
}

export function PropagatedThemeProvider({ theme, children }) {
    const existingTheme = useTheme()
    // console.log({ existingTheme: existingTheme.sizes })
    const merged = useMemo(() => {
        return merge(existingTheme, theme)
    }, [theme, existingTheme])
    return <ThemeProvider theme={merged}>{children}</ThemeProvider>
}
