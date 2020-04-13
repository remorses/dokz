/** @jsx jsx */
import { ThemeProvider } from '@chakra-ui/core'
import {
    Box,
    Link,
    Stack,
    useColorMode,
    ColorModeProvider,
    CSSReset,
} from '@chakra-ui/core'
import { jsx } from '@emotion/core'
import { FiAirplay } from 'react-icons/fi'
import { LandingProvider } from 'react-landing'
import NavBar from './NavBar'
import { SideNav } from './SideNav'
import { TableOfContents } from './TableOfContents'
import { useDokzConfig } from '../provider'

const SIDENAV_W = 200
const TABLE_OF_C_W = 200

const NAVBAR_H = 60

export function Wrapper(props) {
    const { tableOfContents } = props.meta || {}
    const {
        footer,
        headerLogo,
        headerItems,
        maxPageWidth,
        black,
        initialColorMode
    } = useDokzConfig()
    // const index = require('root_/index.json')
    // console.log('root_', require.resolve('root_'))
    // const { colorMode } = useColorMode()
    // console.log({ colorMode })
    const index = getMdxIndex()
    return (
        <ThemeProvider>
            <ColorModeProvider value={initialColorMode}>
                <CSSReset />
                <Stack
                    align='center'
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
