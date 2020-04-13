/** @jsx jsx */
import {
    Box,
    Callout,
    Code as InlineCode,
    Heading,
    Kbd,
    Link as ChakraLink,
    Link,
    Text,
    useColorMode,
} from '@chakra-ui/core'
import { jsx } from '@emotion/core'
import NextLink from 'next/link'
import { Code } from './Code'
import { Wrapper } from './Wrapper'
import { useDokzConfig } from '../provider'

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

const DocsHeading = (props) => {
    const { headingColor } = useDokzConfig()
    const { colorMode } = useColorMode()
    return (
        <Heading
            fontWeight='semibold'
            // color='black'
            color={headingColor[colorMode]}
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
                        color='gray.500'
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
}

const MdxText = (props) => {
    const { colorMode } = useColorMode()
    return (
        <Text
            as='p'
            mb='20px'
            lineHeight='30px'
            // color={{ light: '#537389', dark: 'white' }[colorMode]}
            {...props}
        />
    )
}
const MDXComponents = {
    wrapper: Wrapper,
    h1: (props) => <DocsHeading as='h1' fontSize='32px' {...props} />,
    h2: (props) => <DocsHeading as='h2' fontSize='26px' {...props} />,
    h3: (props) => <DocsHeading as='h3' size='md' fontSize='24px' {...props} />,
    inlineCode: (props) => {
        const { colorMode } = useColorMode()
        return (
            <InlineCode
                mx='4px'
                color={{ light: '#264459', dark: 'white' }[colorMode]}
                variantColor='gray'
                lineHeight='normal'
                {...props}
            />
        )
    },
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
            <Link fontWeight='medium' textDecoration='underline' {...props} />
        </NextLink>
    ),
    p: (props) => {
        return <MdxText as='p' {...props} />
    },
    ul: (props) => <MdxText as='ul' pt='8px' pl='16px' {...props} />,
    ol: (props) => <MdxText as='ol' pt='8px' pl='16px' {...props} />,
    li: (props) => <MdxText as='li' pb='4px' {...props} />,
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
