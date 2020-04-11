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
        <Stack width='200px' fontWeight='medium' fontSize='14px'>
            <Stack
                borderLeft='1px solid #ddd'
                pl='20px'
                opacity={0.9}
                {...rest}
            >
                {map.map((table) => {
                    return (
                        <TableItems
                            slug={`/#${table.id}`}
                            depth={table.depth}
                            items={table.children}
                        />
                    )
                })}
            </Stack>
        </Stack>
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
    console.log({ items })
    if (!items) {
        return null
    }
    return (
        <Stack ml={baseW * (depth - 1) + 'px'}>
            {items.map((x) => {
                return (
                    <Box minH='30px'>
                        <Link href={slug}>{x.value}</Link>
                    </Box>
                )
            })}
        </Stack>
    )
}
