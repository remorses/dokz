/** @jsx jsx */
import { Box, Callout, Code as InlineCode, Heading, Kbd, Link as ChakraLink, Link, Stack, Text, useColorMode } from '@chakra-ui/core'
import { jsx } from '@emotion/core'
import NextLink from 'next/link'
import { FiAirplay } from 'react-icons/fi'
import { Footer, LandingProvider, PageContainer } from 'react-landing'
import { Code } from './Code'
import NavBar from './NavBar'
import { SideNav } from './SideNav'
import { TableOfContents } from './TableOfContents'

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
        fontWeight='semibold'
        // color='black'
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

function getMdxIndex() {
    try {
        return require('root_/index.json')
    } catch {
        return {
            children: [],
        }
    }
}

export function Wrapper(props) {
    const { tableOfContents } = props.meta
    // console.log({ tableOfContents })
    // console.log({ wrapperPorps: props })
    // TODO show breadcrumbs based on exported breadcrumbs array
    // TODO takes custom elements from context
    const breadcrumbs = props.breadcrumbs || []
    // const index = require('root_/index.json')
    // console.log('root_', require.resolve('root_'))
    const index = getMdxIndex()
    return (
        <LandingProvider black='#264459' primary='#FF593D'>
            <PageContainer pageWidth='1600px' minH='100vh'>
                <NavBar
                    logo={<Box as={FiAirplay} color='black' size='30px' />}
                    tree={index}
                />
                <Stack direction='row' isInline height='100%'>
                    <SideNav
                        alignSelf='flex-start'
                        position='sticky'
                        top={0}
                        tree={index}
                        display={['none', null, 'block']}
                    />
                    <Stack fontSize='16px' px='40px' flex='1'>
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
            <Footer
                bg='gray.100'
                // dark
                columns={{
                    Company: [
                        <Link>ciao</Link>,
                        <Link>ciao</Link>,
                        <Link>ciao</Link>,
                    ],
                    About: [
                        <Link>ciao</Link>,
                        <Link>ciao</Link>,
                        <Link>ciao</Link>,
                    ],
                    Product: [
                        <Link>ciao</Link>,
                        <Link>ciao</Link>,
                        <Link>ciao</Link>,
                    ],
                }}
            />
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
    p: (props) => (
        <Text as='p' mb='20px' lineHeight='30px' color='#60859f' {...props} />
    ),
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
