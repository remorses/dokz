/** @jsx jsx */
import { Box, CSSReset, theme, useColorMode } from '@chakra-ui/core'
import { Global, jsx } from '@emotion/core'
import { Flex, Stack } from 'layout-kit-react'
import { useDokzBlogConfig } from '../blog'
import NavBar from './NavBar'
import { SideNav } from './SideNav'
import { getMdxSidebarTree, globalStyles } from './support'
import { TableOfContents } from './TableOfContents'
import { PropagatedThemeProvider } from './Wrapper'

export function WrapperBlog(props) {
    const {
        title = 'Add a title to this blog post exporting a variable called `title`',
        date = 'Add a date to this blog post exporting a variable called `date`',
    } = props
    const {
        footer,
        headerLogo,
        headerItems,
        maxPageWidth,
        bodyColor,
        fontSize,
        fontFamily,
        fontWeight,
    } = useDokzBlogConfig()
    // const index = getMdxSidebarTree()
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
                <Flex
                    direction='column'
                    align='center'
                    overflow='auto'
                    width='100%'
                    maxW={maxPageWidth}
                    px={['10px', null, '20px', '30px']}
                    // spacing='10px'
                    flex='1'
                    minW='0'
                >
                    <NavBar
                        logo={headerLogo}
                        items={headerItems}
                        // maxW={PAGE_MAX_W}
                        width='100%'
                        // mr='auto'
                        // top={0}
                        py='6'
                        px='0'
                        borderBottomWidth='0px'
                        left={0}
                        right={0}
                    />
                    {/* TODO add social links */}
                    <Box height={['40px', null, '40px']} />
                    <Flex direction='column' width='100%' maxW='800px'>
                        <Stack spacing='6' align='center'>
                            <Box
                                as='h1'
                                fontWeight='600'
                                textAlign='center'
                                lineHeight='1.2em'
                                fontSize='2.4em'
                            >
                                {title}
                            </Box>
                            <Stack
                                align='center'
                                spacing='2'
                                direction='row'
                                opacity={0.5}
                                // fontWeight='400'
                            >
                                <Box size='0.8em' as={DateIcon} />
                                <Box fontWeight='500'>{date}</Box>
                            </Stack>
                        </Stack>
                        <Box height={['40px', null, '40px']} />
                        {props.children}
                        {footer}
                    </Flex>
                </Flex>
            </Stack>
        </PropagatedThemeProvider>
    )
}

const DateIcon = (props) => {
    return (
        <svg
            xmlns='http://www.w3.org/2000/svg'
            role='img'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            stroke-width='1.5'
            {...props}
        >
            <g buffered-rendering='static'>
                <circle cx='12' cy='12' r='10.5' />
                <path d='M11.998 4.254l.002 7.746M16.569 14.639l-4.571-2.639' />
            </g>
        </svg>
    )
}
