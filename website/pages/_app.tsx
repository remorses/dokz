import { DoczProvider, GithubLink, ColorModeSwitch } from 'dokz/dist'
import { useColorMode } from '@chakra-ui/core'
import React from 'react'
import { DokzLogo, DokzLogoWhite } from '../svgs'

export default (props) => {
    const { Component, pageProps } = props
    return (
        <DoczProvider
            headerItems={[
                <GithubLink key={0} url='https://github.com/remorses/dokz' />,
                <ColorModeSwitch key={1} />,
            ]}
            headerLogo={<Logo width='100px' opacity={.9} />}
            sidebarOrdering={{
                index: null,
                general: {
                    'getting-started': null,
                    'writing-mdx': null,
                    'document-settings': null,
                    'preview-react-components': null,
                },
                customizing: {
                    'customizing-elements': null,
                    'change-sidebar-order': null,
                },
            }}
        >
            <Component {...pageProps} />
        </DoczProvider>
    )
}

const Logo = (props) => {
    const { colorMode } = useColorMode()
    return colorMode === 'dark' ? (
        <DokzLogoWhite {...props} />
    ) : (
        <DokzLogo {...props} />
    )
}
