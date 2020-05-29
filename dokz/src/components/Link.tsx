import { Link as Link_, LinkProps as LinkProps_, useColorMode } from '@chakra-ui/core'
import React from 'react'

export type LinkProps = LinkProps_

export const Link = ({ children, ...props }: LinkProps) => {
    const { colorMode } = useColorMode()
    const color = {light: 'blue.500',  dark: 'blue.300'}[colorMode]
    return (
        <Link_
            w='fit-content'
            position='relative'
            lineHeight='1.4em'
            textDecoration='none'
            color={color}
            fontWeight='medium'
            fontSize='text'
            borderBottom='2px solid'
            borderColor='transparent'
            py='0.2em'
            isTruncated
            transition='all 0.3s ease-in-out 0s'
            _hover={{
                borderColor: 'currentColor',
            }}
            {...props}
        >
            {children}
        </Link_>
    )
}
