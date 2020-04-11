import { DoksTableOfContents } from '../types'
import { Stack, Box } from '@chakra-ui/core'
import React from 'react'

export const TableOfContents = ({ table }: { table: DoksTableOfContents }) => {
    if (!table) {
        return null
    }
    const map = table.map
    return (
        <Stack>
            {map.map((table) => {
                return <TableItems depth={table.depth} items={table.children} />
            })}
        </Stack>
    )
}

function TableItems({
    items,
    depth,
}: {
    items: DoksTableOfContents['map'][0]['children'][0][]
    depth: number
}) {
    console.log({ items })
    if (!items) {
        return null
    }
    return (
        <Stack width='200px' ml={10 * depth + 'px'}>
            {items.map((x) => {
                return <Box>{x.value}</Box>
            })}
        </Stack>
    )
}
