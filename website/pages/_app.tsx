import { ThemeProvider } from '@chakra-ui/core'
import { ColorModeSwitch, DokzProvider, GithubLink } from 'dokz/src'
import { LandingProvider } from 'landing-blocks'
import 'mini-graphiql/dist/style.css'
import React from 'react'
import { Logo } from '../components/Logo'



export default (props) => {
    const { Component, pageProps } = props
    return (
        <ThemeProvider>
            <LandingProvider
                fontFamily='Roboto, Arial'
                black='#222'
                primary='#2D7FF9'
            >
                <DokzProvider
                    docsRootPath='pages/docs'
                    headerItems={[
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
    )
}
