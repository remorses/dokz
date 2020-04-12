/** @jsx jsx */
import { Code } from './Code'
import importFrom from 'import-from'
import {
    Box,
    Callout,
    Heading,
    Kbd,
    PseudoBox,
    Text,
    useColorMode,
    Link as ChakraLink,
    Link,
    Stack,
    Code as InlineCode,
} from '@chakra-ui/core'
import { jsx } from '@emotion/core'
import NextLink from 'next/link'
import { forwardRef } from 'react'
import { Button, LandingProvider, PageContainer, Footer } from 'react-landing'
import { SideNav } from './SideNav'
import NavBar from './NavBar'
import { DoksTableOfContents } from '../types'
import { TableOfContents } from './TableOfContents'
import { ComponentLink } from './NavLink'

const Pre = (props) => <Box my='2em' rounded='sm' {...props} />

const Table = (props) => (
    <Box as='table' textAlign='left' mt='32px' width='full' {...props} />
)

const THead = (props) => {
    const { colorMode } = useColorMode()
    const bg = { light: 'gray.50', dark: 'whiteAlpha.100' }
    return (
        <Box
            as='th'
            bg={bg[colorMode]}
            fontWeight='semibold'
            p={2}
            fontSize='sm'
            {...props}
        />
    )
}

const TData = (props) => (
    <Box
        as='td'
        p={2}
        borderTopWidth='1px'
        borderColor='inherit'
        fontSize='sm'
        whiteSpace='normal'
        {...props}
    />
)

const DocsHeading = (props) => (
    <Heading
        color='#264459'
        fontWeight='semibold'
        my='40px'
        css={{
            '&[id]': {
                pointerEvents: 'none',
            },
            '&[id]:before': {
                display: 'block',
                height: ' 6rem',
                marginTop: '-6rem',
                visibility: 'hidden',
                content: `""`,
            },
            '&[id]:hover a': { opacity: 1 },
        }}
        {...props}
    >
        <Box pointerEvents='auto'>
            {props.children}
            {props.id && (
                <ChakraLink
                    aria-label='anchor'
                    as='a'
                    color='teal.500'
                    fontWeight='normal'
                    outline='none'
                    _focus={{ opacity: 1, boxShadow: 'outline' }}
                    opacity={0}
                    ml='0.375rem'
                    href={`#${props.id}`}
                >
                    #
                </ChakraLink>
            )}
        </Box>
    </Heading>
)

export function Wrapper(props) {
    const { tableOfContents } = props.meta
    // console.log({ tableOfContents })
    // console.log({ wrapperPorps: props })
    // TODO show breadcrumbs based on exported breadcrumbs array
    // TODO add footer, sidebar, toc, ...
    const breadcrumbs = props.breadcrumbs || []
    // const index = require('root_/index.json')
    // console.log('root_', require.resolve('root_'))
    const index = require('root_/index.json')
    return (
        <LandingProvider primary='#FF593D'>
            <PageContainer pageWidth='1400px'>
                <NavBar tree={index} />
                <Stack direction='row' isInline height='100%'>
                    <SideNav
                        alignSelf='flex-start'
                        position='sticky'
                        top={0}
                        tree={index}
                        display={['none', null, 'block']}
                    />
                    <Stack fontSize='16px' color='#60859f' px='40px' flex='1'>
                        {props.children}
                    </Stack>
                    <TableOfContents
                        position='sticky'
                        alignSelf='flex-start'
                        top={0}
                        height='auto'
                        display={['none', null, 'block']}
                        pt='40px'
                        table={tableOfContents}
                    />
                </Stack>
            </PageContainer>
        </LandingProvider>
    )
}

const MDXComponents = {
    wrapper: Wrapper,
    h1: (props) => <DocsHeading as='h1' fontSize='32px' {...props} />,
    h2: (props) => <DocsHeading as='h2' fontSize='26px' {...props} />,
    h3: (props) => <DocsHeading as='h3' size='md' fontSize='24px' {...props} />,
    inlineCode: (props) => (
        <InlineCode
            mx='4px'
            color='#264459'
            variantColor='gray'
            lineHeight='normal'
            {...props}
        />
    ),
    code: (props) => (
        <Box>
            <Code {...props} />
        </Box>
    ),
    pre: Pre,
    kbd: Kbd,
    br: (props) => <Box height='24px' {...props} />,
    hr: (props) => <Box as='hr' borderTopWidth='1px' my={8} {...props} />,
    table: Table,
    th: THead,
    td: TData,
    a: ({ href = '', ...props }) => (
        <NextLink href={href} passHref>
            <Link {...props} />
        </NextLink>
    ),
    p: (props) => <Text as='p' mb='20px' lineHeight='30px' {...props} />,
    ul: (props) => <Box as='ul' pt='8px' pl='16px' {...props} />,
    ol: (props) => <Box as='ol' pt='8px' pl='16px' {...props} />,
    li: (props) => <Box as='li' pb='4px' {...props} />,
    blockquote: (props) => (
        <Callout
            mt={4}
            variant='left-accent'
            status='warning'
            css={{ '> *:first-of-type': { marginTop: 0 } }}
            {...props}
        />
    ),
}

// const ChakraProvider = ({ children, theme }) => {
//   return (
//     <ThemeProvider theme={theme}>
//       <ColorModeProvider>
//         <CSSReset />
//         {children}
//       </ColorModeProvider>
//     </ThemeProvider>
//   );
// };

export default MDXComponents
