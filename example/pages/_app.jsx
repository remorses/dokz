import { DokzProvider, GithubLink, ColorModeSwitch } from 'dokz/dist'
import React from 'react'

export default function App(props) {
    const { Component, pageProps } = props
    return (
        <DokzProvider
            headerItems={[
                <GithubLink key='0' url='https://github.com/remorses/dokz' />,
                <ColorModeSwitch key='1' />,
            ]}
            sidebarOrdering={{
                'index.mdx': true,
                Documents_Group: {
                    'another.mdx': true,
                },
            }}
        >
            <Component {...pageProps} />
        </DokzProvider>
    )
}
