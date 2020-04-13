/** @jsx jsx */
import {
    Box,
    Flex,
    Icon,
    Input,
    InputGroup,
    InputLeftElement,
    IconButton,
    useColorMode,
    PseudoBox,
    Stack,
} from '@chakra-ui/core'
import { jsx, css } from '@emotion/core'
import { DiGithubBadge } from 'react-icons/di'
import MobileNav from './MobileNav'
import { PageContainer } from 'react-landing'

const styles = css`
    .algolia-autocomplete {
        display: block !important;
    }
    .algolia-docsearch-suggestion--wrapper {
        /* display: none !important; */
    }
`

const SearchBox = (props) => (
    <InputGroup css={styles} {...props}>
        <InputLeftElement>
            <Icon name='search' color='gray.500' />
        </InputLeftElement>
        <Input
            id='algolia-search'
            variant='filled'
            placeholder='Search the docs '
            // _focusBorderColor="teal"
            _placeholder={{ color: 'gray.500', opacity: 1 }}
            rounded='lg'
        />
    </InputGroup>
)

export { default as MDXComponents } from './mdx'
export { Wrapper } from './Wrapper'
export { ColorModeSwitch, GithubLink } from './NavBar'
export { TableOfContents } from './TableOfContents'
export { Code, Playground } from './Code'
