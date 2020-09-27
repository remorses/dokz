import { DokzTableOfContents } from '../types'
import { Stack, Box, Link, Button } from '@chakra-ui/core'
import React, { useState, useEffect } from 'react'
import { StackProps } from '@chakra-ui/core'
import pick from 'lodash/pick'
import parseGithubUrl from 'parse-github-url'
import { useDokzConfig } from '../provider'

export function FloatingTableOfContents({
    table,
    ...rest
}: {
    table: DokzTableOfContents
} & StackProps) {
    const { branch, githubUrl } = useDokzConfig()
    const { editThisPagePath } = useWindowParams()
    const editUrl = makeGithubEditUrl({
        branch,
        githubUrl,
        path: editThisPagePath,
    })
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
            {githubUrl && (
                <Box
                    as='a'
                    display='inline-block'
                    // @ts-ignore
                    target='_blank'
                    // @ts-ignore
                    href={editUrl}
                >
                    <Button fontWeight='600' variant='solid'>
                        Edit This Page
                    </Button>
                </Box>
            )}
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
            <Box whiteSpace='nowrap' minH='1.6em'>
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

function makeGithubEditUrl({ githubUrl = '', branch, path: p }) {
    try {
        const parsed = parseGithubUrl(githubUrl)
        return `https://github.com/${parsed?.owner}/${parsed?.name}/edit/${branch}/${p}`
    } catch {
        return ''
    }
}

function useWindowParams(): { editThisPagePath?: string } {
    const [picked, setC] = useState({ editThisPagePath: '' })
    useEffect(() => {
        if (typeof window === undefined) {
            return
        } else {
            const keys = ['editThisPagePath']
            const picked = pick(window as {}, keys)
            if (Object.keys(picked).length === 0) {
                return
            }
            setC(picked as any)
        }
    }, [])
    return picked
}
