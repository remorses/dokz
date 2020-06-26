import { useColorMode } from '@chakra-ui/core'
import { Box, Flex, Stack } from 'layout-kit-react'
import React, { ReactNode } from 'react'
import { useDokzBlogConfig } from '../blog'
import { DateIcon } from './icons'
import { findTreeInPath, formatTitle, getMdxSidebarTree } from './support'
import { BaseWrapperBlog } from './WrapperBlog'

export type BlogPostsProps = {
    heading?: ReactNode
    subheading?: ReactNode
    footer?: ReactNode
}

const BG = 'linear-gradient(90deg, rgb(44, 206, 193), rgb(0, 129, 214))'

export const BlogPosts = ({
    heading = 'Blog Posts',
    subheading = 'NEWS, ANNOUNCEMENTS & TIPS',
    footer = null,
}: BlogPostsProps) => {
    const { blogRootPath } = useDokzBlogConfig()
    if (!blogRootPath) {
        throw new Error(
            '`blogRootPath` is necessary to display the posts list, add it in `DokzBlogProvider` props',
        )
    }
    let tree = getMdxSidebarTree()
    tree = findTreeInPath(tree, blogRootPath) || tree
    const { colorMode } = useColorMode()
    return (
        <BaseWrapperBlog overflow='hidden' align='center'>
            <Box
                position='absolute'
                bg={{ light: 'gray.100', dark: 'rgba(0,0,0,.1)' }[colorMode]}
                top='-100px'
                left='0'
                right='0'
                height='700px'
                transform='rotate(4deg) skew(4deg)'
            />
            <Stack
                position='relative'
                align='center'
                mt={['8', null, '24']}
                mb={['10', null, '32']}
                spacing='10'
                alignSelf='center'
            >
                <Box
                    as='h1'
                    fontWeight='600'
                    textAlign='center'
                    lineHeight='1.2em'
                    fontSize='2.4em'
                >
                    {heading}
                </Box>
                <Box
                    as='p'
                    fontWeight='600'
                    textAlign='center'
                    lineHeight='1.2em'
                    opacity={0.5}
                >
                    {subheading}
                </Box>
            </Stack>

            <Flex
                position='relative'
                justify='center'
                direction='row'
                flexWrap='wrap'
            >
                {tree.children &&
                    tree.children.map((node, i) => {
                        const { meta = {} } = node
                        return (
                            <BlogPostCard
                                url={node.url || '#'}
                                m='8'
                                key={node.url + i}
                                title={node.title || formatTitle(node.name)}
                                date={meta.date}
                                description={meta.description}
                                width='350px'
                            />
                        )
                    })}
            </Flex>
            {footer}
            {/* <Stack as='pre'>{JSON.stringify(tree, null, 4)}</Stack> */}
        </BaseWrapperBlog>
    )
}

export const BlogPostCard = ({ title, date, url, description, ...rest }) => {
    const { colorMode } = useColorMode()
    return (
        <Stack
            as='a'
            borderRadius='md'
            // borderWidth='1px'
            // @ts-ignore
            href={url}
            overflow='hidden'
            h='auto'
            p='0'
            align='stretch'
            // minWidth='300px'
            shadow='lg'
            bg={{ light: 'white', dark: 'gray.700' }[colorMode]}
            {...rest}
        >
            <Stack w='100%' spacing='4' p='6'>
                <Box fontWeight='semibold'>{title}</Box>
                <Box fontSize='0.9em' opacity={0.7}>
                    {description || ''}
                </Box>
            </Stack>
            <Box flex='1' />
            <Stack
                // alignSelf='flex-end'
                align='flex-end'
                fontSize='0.9em'
                opacity={0.7}
                w='100%'
                px='6'
                py='4'
                bg={{ light: 'gray.100', dark: 'gray.800' }[colorMode]}
            >
                <Stack
                    align='center'
                    spacing='2'
                    direction='row'
                    opacity={0.6}
                    // fontWeight='400'
                >
                    <Box size='0.9em' as={DateIcon} />
                    <Box>{date || 'Unknown publishing date'}</Box>
                </Stack>
            </Stack>
        </Stack>
    )
}
