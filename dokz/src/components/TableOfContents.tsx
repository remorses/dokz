/** @jsxRuntime classic */
/** @jsx jsx */
import { jsx } from '@emotion/react'
import { DokzTableOfContents } from '../types'
import { Stack, Box } from '@chakra-ui/react'
import { Link } from './Link'
import { Faded } from 'baby-i-am-faded'
import React, { createContext, useContext } from 'react'
import { StackProps } from '@chakra-ui/react'
import { TableOfContentsContext, useAnimationComponent } from '../provider'

export function TableOfContents({ ...rest }: StackProps) {
    const { tableOfContents } = useContext(TableOfContentsContext)
    if (!tableOfContents) {
        return null
    }
    const Faded = useAnimationComponent()
    return (
        <Stack my='10px' spacing='0.6em' as={Faded} cascade {...rest}>
            {/* <Box fontWeight='600' opacity={0.6}>
                Table of Contents
            </Box> */}
            {tableOfContents?.children?.map((table) => {
                return <TableItem key={table.slug} {...table} />
            })}
        </Stack>
    )
}

function TableItem({
    children,
    depth,
    title,
    slug,
    ...rest
}: DokzTableOfContents) {
    const baseW = 20
    return (
        <Stack {...rest}>
            <Box isTruncated minH='1.6em'>
                <Link href={slug}>{title}</Link>
            </Box>
            <Stack ml={baseW * depth + 'px'}>
                {children &&
                    children.map((table) => {
                        return <TableItem key={table.slug} {...table} />
                    })}
            </Stack>
        </Stack>
    )
}
