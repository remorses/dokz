import { DoczProvider, GithubLink, ColorModeSwitch } from 'dokz/dist'
import { useColorMode } from '@chakra-ui/core'
import React from 'react'
import { Logo } from '../components/Logo'

export default (props) => {
    const { Component, pageProps } = props
    return (
        <DoczProvider
            headerItems={[
                <GithubLink key={0} url='https://github.com/remorses/dokz' />,
                <ColorModeSwitch key={1} />,
            ]}
            headerLogo={<Logo height='30px' opacity={.92} />}
            sidebarOrdering={{
                docs: {
                    index: null,
                    'getting-started': null,
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
        </DoczProvider>
    )
}
