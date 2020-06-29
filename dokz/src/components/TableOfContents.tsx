import { DokzTableOfContents } from '../types'
import { Stack, Box } from '@chakra-ui/core'
import { Link } from './Link'
import React, { createContext, useContext } from 'react'
import { StackProps } from '@chakra-ui/core'
import { TableOfContentsContext } from '../provider'

export function TableOfContents({ ...rest }: StackProps) {
    const { tableOfContents } = useContext(TableOfContentsContext)
    if (!tableOfContents) {
        return null
    }
    return (
        <Stack my='10px' spacing='0.6em' {...rest}>
            {/* <Box fontWeight='600' opacity={0.6}>
                Table of Contents
            </Box> */}
            {tableOfContents?.children?.map((table) => {
                return <TableItem key={table.slug} {...table} />
            })}
        </Stack>
    )
}

function TableItem({ children, depth, title, slug }: DokzTableOfContents) {
    const baseW = 20
    return (
        <Stack>
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
