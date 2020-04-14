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
    /*
    The logo displayed on the header nav bar
    */
    headerLogo?: ReactNode
    /*
    Links in the right nav bar
    */
    headerItems?: ReactNode[] | ReactNode
    /*
    Footer at the end of every mdx page
    */
    footer?: ReactNode
    /*
    Mdx object mapping from mdx element to component
    */
    mdxComponents?: { [k: string]: ComponentType<any> }
    /*
    The variables available in the live playground
    */
    playgroundScope?: { [k: string]: any }
    /*
    The theme for the code blocks
    */
    prismTheme?: { dark: PrismTheme; light: PrismTheme }
    /*
    The max-width of the page container, defaults to '1600px'
    */
    maxPageWidth?: string
    /*
    The initial color mode
    */
    initialColorMode?: 'dark' | 'light'
    /*
    The color of the page text
    */
    bodyColor?: { dark: string; light: string }
    /*
    The color of the heading elements
    */
    headingColor?: { dark: string; light: string }
    /*
    The order of the sidebar links
    */
    sidebarOrdering?: SidebarOrdering
}

export type SidebarOrdering = { [k: string]: SidebarOrdering | null }

const defaultDokzContext: DoczProviderProps = {
    initialColorMode: 'light',
    footer: <Box height='100px' />,
    headerLogo: (
        <Box fontWeight='medium' fontSize='32px'>
            Your Logo
        </Box>
    ),
    headerItems: [<ColorModeSwitch key={0} />],
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
