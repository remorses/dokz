import { ThemeProvider } from '@chakra-ui/core'
import {
    ColorModeSwitch,
    DokzProvider,
    GithubLink,
    DokzBlogProvider,
} from 'dokz/src'
import { LandingProvider, Link } from 'landing-blocks/src'
import 'mini-graphiql/dist/style.css'
import React, { Fragment } from 'react'
import { Logo } from '../components/Logo'
import Head from 'next/head'
import { useRouter } from 'next/router'

export default function App(props) {
    const { Component, pageProps } = props
    const { pathname } = useRouter()
    if (!pathname) {
        throw new Error('pathname undefined')
    }
    if (pathname.startsWith('/blog')) {
        return (
            <DokzBlogProvider
                headerLogo={<Logo height='30px' opacity={0.92} />}
                headerItems={[
                    <Link href='https://github.com/remorses/dokz'>Dokz</Link>,

                    <ColorModeSwitch key={1} />,
                ]}
            >
                <Component {...pageProps} />
            </DokzBlogProvider>
        )
    }
    return (
        <Fragment>
            <Head>
                <link
                    href='https://fonts.googleapis.com/css?family=Fira+Code'
                    rel='stylesheet'
                    key='google-font-Fira'
                />
            </Head>
            <ThemeProvider>
                <LandingProvider
                    // fontFamily='Roboto, Arial'
                    black='#222'
                    primary='#2D7FF9'
                >
                    <DokzProvider
                        docsRootPath='pages/docs'
                        headerItems={[
                            // <a>ciao</a>,
                            <GithubLink
                                key={0}
                                url='https://github.com/remorses/dokz'
                            />,
                            <ColorModeSwitch key={1} />,
                        ]}
                        headerLogo={<Logo height='30px' opacity={0.92} />}
                        sidebarOrdering={{
                            docs: {
                                index: null,
                                'getting-started': null,
                                // 'adding-dokz-to-existing-website': true,
                                general: {
                                    'writing-mdx': null,
                                    'document-settings': null,
                                    'preview-react-components': null,
                                },
                                customizing: {
                                    'customizing-elements': null,
                                    'change-sidebar-order': null,
                                },
                            },
                        }}
                    >
                        <Component {...pageProps} />
                    </DokzProvider>
                </LandingProvider>
            </ThemeProvider>
        </Fragment>
    )
}
