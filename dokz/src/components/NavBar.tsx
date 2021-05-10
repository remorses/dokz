/** @jsx jsx */
import { Faded } from 'baby-i-am-faded'
import { Box, Flex, IconButton, Stack, useColorMode } from '@chakra-ui/react'
import { jsx } from '@emotion/react'
import { DiGithubBadge } from 'react-icons/di'
import { FiMoon, FiSun } from 'react-icons/fi'
import { useDokzConfig } from '../provider'
import MobileNav from './MobileNav'

export const GithubLink = ({ url = '', ...rest }: any) => (
    <Box
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
        <Box as={DiGithubBadge} boxSize='8' color='current' />
    </Box>
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
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            {...rest}
        />
    )
}

const NavBar = ({ logo, tree = null as any, items: navs, ...props }) => {
    const { colorMode, toggleColorMode } = useColorMode()
    const bg = { light: 'rgb(31, 34, 36, 0.9)', dark: 'rgb(31, 34, 36, 0.9)' }
    const { maxPageWidth } = useDokzConfig()
    return (
        <Stack
            bg={bg[colorMode]}
            zIndex={4}
            borderBottomWidth='1px'
            borderBottomStyle='solid'
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
                <Flex align='center' justify='space-between'>
                    <Flex align='center' mr={5}>
                        {logo}
                    </Flex>
                    <Flex
                        flex={{ sm: '1', md: 'none' }}
                        ml={5}
                        align='center'
                        color='#ECEDED'
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
