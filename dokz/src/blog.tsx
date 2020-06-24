import { ColorModeProvider } from '@chakra-ui/core'
import { MDXProvider } from '@mdx-js/react'
import omit from 'lodash/fp/omit'
import React, { createContext, useContext } from 'react'
import MDXComponents from './components/mdx'
import { WrapperBlog } from './components/WrapperBlog'
import { defaultDokzContext, DokzProviderProps } from './provider'

export type DokzBlogProviderProps = DokzProviderProps & {
    docsRootPath?: never
    sidebarOrdering?: never
}

const defaultDokzBlogContext: DokzBlogProviderProps = {
    ...omit(['docsRootPath', 'sidebarOrdering'], defaultDokzContext),
}

const DokzBlogContext = createContext<DokzBlogProviderProps>(
    defaultDokzBlogContext,
)

export function useDokzBlogConfig(): DokzProviderProps {
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
        // TODO merge configs
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
