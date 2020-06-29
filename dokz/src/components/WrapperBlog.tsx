/** @jsx jsx */
import { Box, CSSReset, theme, useColorMode } from '@chakra-ui/core'
import { Global, jsx } from '@emotion/core'
import { Flex, Stack } from 'layout-kit-react'
import { useDokzBlogConfig } from '../blog'
import NavBar from './NavBar'
import { SideNav } from './SideNav'
import { getMdxSidebarTree, globalStyles } from './support'
import { FloatingTableOfContents } from './FloatingTableOfContents'
import { PropagatedThemeProvider } from './Wrapper'
import { DateIcon } from './icons'
import { TableOfContentsContext } from '../provider'

export function WrapperBlog(props) {
    const {
        name: title = 'Add a `name` to the document frontmatter',
        date = 'Add a `date` to the document frontmatter',
    } = props.meta || {}
    const { footer } = useDokzBlogConfig()

    return (
        <BaseWrapperBlog {...props}>
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
        </BaseWrapperBlog>
    )
}

export const BaseWrapperBlog = ({ children, ...rest }) => {
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
    const { colorMode } = useColorMode()
    const { tableOfContents } = rest.meta || {}
    return (
        <PropagatedThemeProvider theme={theme}>
            <TableOfContentsContext.Provider value={{ tableOfContents }}>
                <CSSReset />
                <Global styles={globalStyles} />
                <Stack
                    className='dokz visibleInPrint noMarginInPrint'
                    align='center'
                    color={bodyColor[colorMode]}
                    fontSize={fontSize}
                    fontFamily={fontFamily}
                    fontWeight={fontWeight}
                    // color={colorMode == 'dark' ? 'white' : black}
                >
                    <Flex
                        className='dokz visibleInPrint noMarginInPrint mainContent'
                        direction='column'
                        align='center'
                        overflow='auto'
                        width='100%'
                        maxW={maxPageWidth}
                        px={['10px', null, '20px', '30px']}
                        // spacing='10px'
                        flex='1'
                        minW='0'
                        {...rest}
                    >
                        <NavBar
                            className='dokz hiddenInPrint'
                            logo={headerLogo}
                            items={headerItems}
                            bg='transparent'
                            width='100%'
                            // mr='auto'
                            // top={0}
                            py='6'
                            px='0'
                            borderBottomWidth='0px'
                            left={0}
                            right={0}
                        />
                        {children}
                    </Flex>
                </Stack>
            </TableOfContentsContext.Provider>
        </PropagatedThemeProvider>
    )
}
