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
import { useDokzConfig } from '../provider'

export const GithubLink = ({ url = '', ...rest }: any) => (
    <PseudoBox
        as='a'
        href={url}
        rel='noopener noreferrer'
        target='_blank'
        aria-label="Go to Chakra UI's Github Repo"
        outline='0'
        transition='all 0.2s'
        borderRadius='md'
        _focus={{
            boxShadow: 'outline',
        }}
        {...rest}
    >
        <Box as={DiGithubBadge} size='8' color='current' />
    </PseudoBox>
)

export const ColorModeSwitch = ({ ...rest }) => {
    const { colorMode, toggleColorMode } = useColorMode()
    return (
        <IconButton
            variant='ghost'
            color='current'
            // ml='2'
            fontSize='20px'
            aria-label={`Switch to ${
                colorMode === 'light' ? 'dark' : 'light'
            } mode`}
            onClick={toggleColorMode}
            icon={colorMode === 'light' ? 'moon' : 'sun'}
            {...rest}
        />
    )
}

const NavBar = ({ logo, tree = null as any, items: navs, ...props }) => {
    const { colorMode, toggleColorMode } = useColorMode()
    const bg = { light: 'white', dark: 'gray.800' }
    const { maxPageWidth } = useDokzConfig()
    return (
        <Stack
            bg={bg[colorMode]}
            zIndex={4}
            borderBottomWidth='1px'
            justifyContent='center'
            alignItems='center'
            {...props}
        >
            <Stack
                maxWidth={maxPageWidth}
                as='header'
                width='full'
                // height='60px'
                justify='center'
            >
                <Flex size='100%' px='2' align='center' justify='space-between'>
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
                        {Array.isArray(navs) ? (
                            <Stack direction='row' spacing='20px'>
                                {navs.map((x, i) => (
                                    <Stack
                                        key={i}
                                        fontSize='text'
                                        alignItems='center'
                                        justify='center'
                                        fontWeight='medium'
                                    >
                                        {x}
                                    </Stack>
                                ))}
                            </Stack>
                        ) : (
                            navs
                        )}
                        {tree && <MobileNav tree={tree} />}
                    </Flex>
                </Flex>
            </Stack>
        </Stack>
    )
}

export default NavBar
