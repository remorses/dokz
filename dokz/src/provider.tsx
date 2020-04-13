import { MDXProvider } from '@mdx-js/react'
import React, {
    createContext,
    useContext,
    ReactNode,
    ComponentType,
} from 'react'
import MDXComponents from './components/mdx'
import { ColorModeProvider, Box } from '@chakra-ui/core'

import { PrismTheme } from 'prism-react-renderer'
// import lightTheme from 'prism-react-renderer/themes/nightOwlLight'
import darkPrismTheme from 'prism-react-renderer/themes/nightOwl'
import { GithubLink, ColorModeSwitch } from './components/NavBar'

export type DoczProviderProps = {
    children?: any
    headerLogo?: ReactNode
    headerItems?: ReactNode[] | ReactNode // customize the items, default is the color switch
    footer?: ReactNode
    mdxComponents?: { [k: string]: ComponentType<any> }
    playgroundScope?: { [k: string]: any }
    prismTheme?: { dark: PrismTheme; light: PrismTheme }
    maxPageWidth?: string
    // black?: string
    // showDarkModeSwitch?: boolean
    // primaryColor?: string // maybe used for accenting ceratin element
    initialColorMode?: 'dark' | 'light'
    bodyColor?: { dark: string; light: string }
    headingColor?: { dark: string; light: string }
}

const defaultDokzContext: DoczProviderProps = {
    initialColorMode: 'light',
    footer: null,
    headerLogo: (
        <Box fontWeight='medium' fontSize='32px'>
            Your Logo
        </Box>
    ),
    headerItems: [<ColorModeSwitch />],
    prismTheme: { dark: darkPrismTheme, light: darkPrismTheme },
    maxPageWidth: '1600px',
    bodyColor: { light: '#445d6e', dark: 'rgba(255,255,255,.9)' },
    headingColor: { light: '#264459', dark: 'rgba(255,255,255,1)' },
    // TODO add colors customization
}

const DokzContext = createContext(defaultDokzContext)

export function useDokzConfig(): DoczProviderProps {
    const ctx = useContext(DokzContext)
    return ctx
}

export function DoczProvider({ children, ...rest }: DoczProviderProps) {
    const ctx = { ...defaultDokzContext, ...rest }
    const { mdxComponents: userMDXComponents = {}, initialColorMode } = ctx
    return (
        // TODO merge configs
        <DokzContext.Provider value={ctx}>
            <ColorModeProvider value={initialColorMode}>
                <MDXProvider
                    components={{ ...MDXComponents, ...userMDXComponents }}
                >
                    {children}
                </MDXProvider>
            </ColorModeProvider>
        </DokzContext.Provider>
    )
}
