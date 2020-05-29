import { DoczTableOfContents } from '../types'
import { Stack, Box, Link } from '@chakra-ui/core'
import React from 'react'
import { StackProps } from '@chakra-ui/core'

export function TableOfContents({
    table,
    ...rest
}: {
    table: DoczTableOfContents
} & StackProps) {
    if (!table) {
        return null
    }
    const map = table.map
    return (
        <Box
            width='200px'
            lineHeight='2.4em'
            // fontWeight='medium'
            fontSize='15px'
            borderLeftWidth='1px'
            pl='20px'
            opacity={0.8}
            {...rest}
        >
            <Box fontWeight='semibold'>
                ON THIS PAGE
            </Box>
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
    items: DoczTableOfContents['map'][0]['children'][0][]
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
