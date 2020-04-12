import { MDXProvider } from '@mdx-js/react'
import React from 'react'
import MDXComponents from './components/mdx'
import { ColorModeProvider } from '@chakra-ui/core'
import { ThemeProvider } from '@chakra-ui/core'

export function DoksProvider({ children }) {
    return (
        <ThemeProvider>
            <ColorModeProvider value='light'>
                <MDXProvider components={MDXComponents}>{children}</MDXProvider>
            </ColorModeProvider>
        </ThemeProvider>
    )
}
