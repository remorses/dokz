import { Box, PseudoBox, useColorMode } from '@chakra-ui/core'
import NextLink from 'next/link'
import { useRouter } from 'next/router'
import React, { cloneElement, forwardRef } from 'react'

const NavLink = ({ children, ...props }: any) => {
    const router = useRouter()
    let isActive = false

    if (router.pathname === props.href) {
        isActive = true
    }

    return (
        <NextLink passHref {...props}>
            {typeof children === 'function' ? children(isActive) : children}
        </NextLink>
    )
}

export const stringToUrl = (str, path = '/') => {
    return `${path}${str.toLowerCase().split(' ').join('-')}`
}

export const SideNavLink = forwardRef(
    ({ children, icon, ...props }: any, ref) => {
        const { colorMode } = useColorMode()
        const color = { light: 'gray.700', dark: 'whiteAlpha.700' }
        return (
            <PseudoBox
                ref={ref}
                as='a'
                mx={-2}
                display='flex'
                cursor='pointer'
                alignItems='center'
                px='2'
                py='1'
                transition='all 0.2s'
                // fontWeight='medium'
                outline='none'
                _focus={{ shadow: 'outline' }}
                // color={color[colorMode]}
                _notFirst={{ mt: 1 }}
                {...props}
            >
                {icon && cloneElement(icon, { mr: 3 })}
                <Box>{children}</Box>
            </PseudoBox>
        )
    },
)

export const TopNavLink = forwardRef(({ href, ...props }: any, ref) => {
    return (
        <NavLink href={href}>
            {(isActive) => (
                <SideNavLink
                    ref={ref}
                    aria-current={isActive ? 'page' : undefined}
                    // _hover={{ color: !isActive ? 'inherit' : 'transparent' }}
                    {...(isActive && {
                        color: 'gray.500',
                        fontWeight: 'semibold',
                    })}
                    {...props}
                />
            )}
        </NavLink>
    )
})

export const ComponentLink = forwardRef(({ href, ...props }: any, ref) => {
    const { colorMode } = useColorMode()
    const hoverColor = { light: 'gray.900', dark: 'whiteAlpha.900' }
    const activeColor = { light: 'gray.800', dark: 'gray.200' }
    const activeBg = { light: 'gray.100', dark: 'gray.700' }

    return (
        <NavLink href={href}>
            {(isActive) => (
                <SideNavLink
                    ref={ref}
                    href={href}
                    aria-current={isActive ? 'page' : undefined}
                    _hover={{
                        color: hoverColor[colorMode],
                        transform: 'translateX(4px)',
                    }}
                    {...(isActive && {
                        bg: activeBg[colorMode],
                        rounded: 'sm',
                        color: activeColor[colorMode],
                        _hover: {},
                    })}
                    {...props}
                />
            )}
        </NavLink>
    )
})
