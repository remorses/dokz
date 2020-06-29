import { ColorModeProvider, useColorMode } from '@chakra-ui/core'
import { MDXProvider } from '@mdx-js/react'
import omit from 'lodash/fp/omit'
import React, { createContext, useContext, ReactNode } from 'react'
import MDXComponents from './components/mdx'
import { WrapperBlog, BaseWrapperBlog } from './components/WrapperBlog'
import { defaultDokzContext, DokzProviderProps } from './provider'
import { Stack, Box, Flex } from 'layout-kit-react'
import {
    getMdxSidebarTree,
    findTreeInPath,
    formatTitle,
} from './components/support'
import { DateIcon } from './components/icons'

export type DokzBlogProviderProps = Omit<
    DokzProviderProps,
    'sidebarOrdering' | 'docsRootPath'
> & {
    /* The folder containing the blog posts as mdx documents */
    blogRootPath?: string
}

const defaultDokzBlogContext: DokzBlogProviderProps = {
    ...omit(['docsRootPath', 'sidebarOrdering'], defaultDokzContext),
}

const DokzBlogContext = createContext<DokzBlogProviderProps>(
    defaultDokzBlogContext,
)

export function useDokzBlogConfig(): DokzBlogProviderProps {
    const ctx = useContext(DokzBlogContext)
    return ctx
}

const blogMDXComponents = {
    ...MDXComponents,
    wrapper: WrapperBlog,
}

export function DokzBlogProvider({ children, ...rest }: DokzBlogProviderProps) {
    const ctx = { ...defaultDokzBlogContext, ...rest }
    const { mdxComponents: userMDXComponents = {}, initialColorMode } = ctx
    return (
        <DokzBlogContext.Provider value={ctx}>
            <ColorModeProvider value={initialColorMode}>
                <MDXProvider
                    components={{ ...blogMDXComponents, ...userMDXComponents }}
                >
                    {children}
                </MDXProvider>
            </ColorModeProvider>
        </DokzBlogContext.Provider>
    )
}
