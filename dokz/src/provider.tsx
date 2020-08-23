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
import darkPrismTheme from 'prism-react-renderer/themes/oceanicNext'
import { GithubLink, ColorModeSwitch } from './components/NavBar'
import { Arrow, ArrowEmpty } from './components/icons'
import { DokzTableOfContents } from './types'
import { Global } from '@emotion/core'

export type DokzProviderProps = {
    children?: any
    /*
    The logo displayed on the header nav bar
    */
    headerLogo?: ReactNode
    /*
    The page fontSize
    */
    fontSize?: string | string[]
    /*
    The page fontWeight, defaults to 400
    */
    fontWeight?: string
    /*
    The root folder of your docs documents, hides the outer folders from the sidenav
    */
    docsRootPath?: string
    /*
    The icon used to prefix a list item inside <ul> or <ol>
    */
    listItemIcon?: React.ComponentType
    /*
    The icon used to prefix a list item inside <ul> or <ol>, in nested lists
    */
    listItemIconEmpty?: React.ComponentType
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
    /*
    The font family
    */
    fontFamily?: string
    /*
    The github url, used by the `Edit this page` feature
    */
    githubUrl?: string
    /*
    The branch with up to date code, used by the `Edit this page` feature
    */
    branch?: string
}

export type SidebarOrdering = { [k: string]: SidebarOrdering } | boolean

const defaultDarkPrismTheme = {
    ...darkPrismTheme,
    plain: {
        ...darkPrismTheme.plain,
        backgroundColor: '#2D3748',
    },
}

export const defaultDokzContext: DokzProviderProps = {
    initialColorMode: 'light',
    branch: 'master',
    footer: null,
    headerLogo: (
        <Box fontWeight='medium' fontSize='32px'>
            Your Logo
        </Box>
    ),
    listItemIcon: Arrow,
    listItemIconEmpty: ArrowEmpty,
    headerItems: [<ColorModeSwitch key={0} />],
    prismTheme: { dark: defaultDarkPrismTheme, light: darkPrismTheme },
    maxPageWidth: '1600px',
    bodyColor: { light: '#222', dark: 'rgba(255,255,255,.9)' },
    headingColor: { light: '#111', dark: 'rgba(255,255,255,1)' },
    fontSize: ['16px', null, null, '18px'],
    fontFamily: `-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"`,
    // fontFamily:
    //     '-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif,Apple Color Emoji,Segoe UI Emoji',
    fontWeight: '400',
}

const DokzContext = createContext(defaultDokzContext)

export function useDokzConfig(): DokzProviderProps {
    const ctx = useContext(DokzContext)
    return ctx
}

export function DokzProvider({ children, ...rest }: DokzProviderProps) {
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

// table of contents

const defaultTableOfContents: DokzTableOfContents = {
    children: [],
    depth: 0,
}

export const TableOfContentsContext = createContext({
    tableOfContents: defaultTableOfContents,
})
