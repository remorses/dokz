import { DoczProvider, GithubLink, ColorModeSwitch } from 'dokz/dist'
import React from 'react'

export default (props) => {
    const { Component, pageProps } = props
    return (
        <DoczProvider
            headerItems={[
                <GithubLink url='https://github.com/remorses/dokz' />,
                <ColorModeSwitch />,
            ]}
            maxPageWidth
            headerLogo={
                <img
                    src='/dokz_logo.svg'
                    style={{ opacity: 0.8 }}
                    width='100px'
                />
            }
            sidebarOrdering={{
                general: {
                    introduction: null,
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
