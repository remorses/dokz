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

export const GithubLink = (props) => (
    <PseudoBox
        as='a'
        href='https://github.com/chakra-ui/chakra-ui/tree/master/packages/chakra-ui'
        rel='noopener noreferrer'
        target='_blank'
        aria-label="Go to Chakra UI's Github Repo"
        outline='0'
        transition='all 0.2s'
        borderRadius='md'
        _focus={{
            boxShadow: 'outline',
        }}
        {...props}
    >
        <Box as={DiGithubBadge} size='8' color='current' />
    </PseudoBox>
)

const ThemeSwitch = (props) => (
    <IconButton
        variant='ghost'
        color='current'
        ml='2'
        fontSize='20px'
        {...props}
    />
)

const NavBar = ({ logo, tree, ...props }) => {
    const { colorMode, toggleColorMode } = useColorMode()

    const bg = { light: 'white', dark: 'gray.800' }
    return (
        <PageContainer
            bg={bg[colorMode]}
            zIndex={4}
            borderBottomWidth='1px'
            justify='center'
            {...props}
        >
            <Stack as='header' width='full' height='40px' justify='center'>
                <Flex size='100%' px='6' align='center' justify='space-between'>
                    <Flex align='center' mr={5}>
                        {logo}
                    </Flex>
                    <Flex
                        flex={{ sm: '1', md: 'none' }}
                        ml={5}
                        align='center'
                        color='gray.500'
                        justify='flex-end'
                    >
                        <GithubLink />
                        <ThemeSwitch
                            aria-label={`Switch to ${
                                colorMode === 'light' ? 'dark' : 'light'
                            } mode`}
                            onClick={toggleColorMode}
                            icon={colorMode === 'light' ? 'moon' : 'sun'}
                        />
                        <MobileNav tree={tree} />
                    </Flex>
                </Flex>
            </Stack>
        </PageContainer>
    )
}

export default NavBar
