import { MDXProvider } from '@mdx-js/react'
import React from 'react'
import MDXComponents from './components/mdx'
import { ThemeProvider } from '@chakra-ui/core'

export function DoksProvider({ children }) {
    return (
        <ThemeProvider>
            <MDXProvider components={MDXComponents}>{children}</MDXProvider>
        </ThemeProvider>
    )
}
