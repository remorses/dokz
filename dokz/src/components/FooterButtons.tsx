import { Stack, Box } from 'layout-kit-react'
import NextLink from 'next/link'
import { Link } from '@chakra-ui/core'
import React from 'react'
import { useDokzConfig } from '../provider'
import { getMdxSidebarTree, findSubtreeInPathByUrl } from './support'
import { useRouter } from 'next/router'
import { Arrow } from './icons'
import { title } from 'process'

export const FooterButtons = ({ ...rest }) => {
    const { pathname } = useRouter()
    const tree = getMdxSidebarTree()
    // console.log('tree', tree)
    // console.log('pathname', pathname)
    const { next, previous } = findSubtreeInPathByUrl(tree, pathname) || {}
    // console.log('subtree', next, previous)
    return (
        <Stack direction={['column', null, 'row']} spacing='6' {...rest}>
            {previous?.url ? (
                <Button
                    title={previous?.title}
                    type='previous'
                    href={previous?.url}
                    w='100%'
                />
            ) : (
                <Box w='100%' />
            )}
            {/* <Box flex='1' /> */}
            {next?.url ? (
                <Button
                    title={next?.title}
                    type='next'
                    href={next?.url}
                    w='100%'
                />
            ) : (
                <Box w='100%' />
            )}
        </Stack>
    )
}

const Button = ({ href = '', title, type, ...rest }) => {
    const arrow = (
        <Box
            transform={type === 'next' ? 'none' : 'scale(-1, 1)'}
            size='1.2em'
            as={Arrow}
        />
    )
    return (
        <NextLink href={href} passHref>
            <Stack
                align={type === 'next' ? 'flex-end' : 'flex-start'}
                spacing='2'
                shadow='md'
                borderWidth='1px'
                borderRadius='md'
                px='6'
                py='4'
                as='a'
                fontWeight='medium'
                {...rest}
            >
                <Stack direction='row' align='center' spacing='2' opacity={0.4}>
                    {type == 'previous' && arrow}
                    <Box fontWeight='600'>
                        {type === 'next' ? 'Next' : 'Previous'}
                    </Box>
                    {type == 'next' && arrow}
                </Stack>
                <Box isTruncated>{title}</Box>
            </Stack>
        </NextLink>
    )
}
