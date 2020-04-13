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
    prismTheme?: PrismTheme | ((mode: 'dark' | 'light') => PrismTheme)
    maxPageWidth?: string
    // black?: string
    // showDarkModeSwitch?: boolean
    // primaryColor?: string // maybe used for accenting ceratin element
    initialColorMode?: 'dark' | 'light'
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
    prismTheme: darkPrismTheme,
    // black: '#264459',
    maxPageWidth: '1600px',
    // TODO add colors customization
}

const DokzContext = createContext(defaultDokzContext)

export function useDokzConfig(): DoczProviderProps {
    const ctx = useContext(DokzContext)
    return ctx
}

export function DoczProvider({ children, ...rest }: DoczProviderProps) {
    const { mdxComponents: userMDXComponents = {} } = rest
    return (
        // TODO merge configs
        <DokzContext.Provider value={{ ...defaultDokzContext, ...rest }}>
            <MDXProvider
                components={{ ...MDXComponents, ...userMDXComponents }}
            >
                {children}
            </MDXProvider>
        </DokzContext.Provider>
    )
}
