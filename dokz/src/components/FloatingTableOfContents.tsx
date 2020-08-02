import { DokzTableOfContents } from '../types'
import { Stack, Box, Link, Button } from '@chakra-ui/core'
import React from 'react'
import { StackProps } from '@chakra-ui/core'

export function FloatingTableOfContents({
    table,
    ...rest
}: {
    table: DokzTableOfContents
} & StackProps) {
    if (!table) {
        return null
    }
    return (
        <Stack
            spacing='1em'
            width='200px'
            // minH='1.6em'
            // lineHeight='2.2em'
            // fontWeight='medium'
            // borderLeftWidth='1px'
            pl='20px'
            {...rest}
        >
            <Button fontWeight='600' variant='solid'>
                Edit This Page
            </Button>
            {/* <Box fontWeight='semibold'>ON THIS PAGE</Box> */}
            {table.children &&
                table.children.map((table) => {
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
