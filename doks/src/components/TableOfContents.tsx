import { DoksTableOfContents } from '../types'
import { Stack, Box, Link } from '@chakra-ui/core'
import React from 'react'
import { StackProps } from '@chakra-ui/core'

export function TableOfContents({
    table,
    ...rest
}: {
    table: DoksTableOfContents
} & StackProps) {
    if (!table) {
        return null
    }
    const map = table.map
    return (
        <Box
            width='200px'
            fontWeight='medium'
            fontSize='14px'
            borderLeftWidth='1px'
            pl='20px'
            opacity={0.9}
            {...rest}
        >
            {map.map((table) => {
                return (
                    <TableItems
                        key={table.id}
                        slug={`#${table.id}`}
                        depth={table.depth}
                        items={table.children}
                    />
                )
            })}
        </Box>
    )
}

function TableItems({
    items,
    depth,
    slug,
}: {
    items: DoksTableOfContents['map'][0]['children'][0][]
    depth: number
    slug
}) {
    const baseW = 20
    if (!items) {
        return null
    }
    return (
        <Stack ml={baseW * (depth - 1) + 'px'}>
            {items.map((x, i) => {
                return (
                    <Box key={i} isTruncated minH='30px'>
                        <Link href={slug}>{x.value}</Link>
                    </Box>
                )
            })}
        </Stack>
    )
}
