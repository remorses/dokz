/** @jsx jsx */
import {
    Box,
    ColorModeProvider,
    CSSReset,
    Stack,
    ThemeProvider,
    useColorMode,
} from '@chakra-ui/core'
import { jsx } from '@emotion/core'
import { useDokzConfig } from '../provider'
import NavBar from './NavBar'
import { SideNav } from './SideNav'
import { Global, css } from '@emotion/core'
import { TableOfContents } from './TableOfContents'
import { Fragment } from 'react'

const SIDENAV_W = 200
const TABLE_OF_C_W = 200

const NAVBAR_H = 60

const globalStyles = css`
    * {
        box-sizing: border-box;
    }
`

const RenderColorMode = ({ children }) => {
    const { colorMode } = useColorMode()
    return <Fragment>{children({ colorMode })}</Fragment>
}

export function Wrapper(props) {
    const { tableOfContents } = props.meta || {}
    const {
        footer,
        headerLogo,
        headerItems,
        maxPageWidth,
        initialColorMode,
        bodyColor,
    } = useDokzConfig()
    const index = getMdxIndex()
    return (
        <ThemeProvider>
            <ColorModeProvider value={initialColorMode}>
                <CSSReset />
                <Global styles={globalStyles} />
                <RenderColorMode>
                    {({ colorMode }) => (
                        <Stack
                            align='center'
                            color={bodyColor[colorMode]}
                            // fontFamily='Roboto, Arial'
                            // color={colorMode == 'dark' ? 'white' : black}
                        >
                            <Box
                                position='relative'
                                w='100%'
                                maxWidth={maxPageWidth}
                            >
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
                                    overflowY='scroll'
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
                                        px='40px'
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
                    )}
                </RenderColorMode>
            </ColorModeProvider>
        </ThemeProvider>
    )
}

function getMdxIndex() {
    try {
        return require('root_/index.json')
    } catch {
        return {
            children: [],
        }
    }
}
