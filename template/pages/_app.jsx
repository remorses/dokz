import { DokzProvider, GithubLink, ColorModeSwitch } from 'dokz/dist'
import React from 'react'

export default (props) => {
    const { Component, pageProps } = props
    return (
        <DokzProvider
            headerItems={[
                <GithubLink key='0' url='https://github.com/remorses/dokz' />,
                <ColorModeSwitch key='1' />,
            ]}
            headerLogo={
                <img
                    src='/dokz_logo.svg'
                    width='100px'
                />
            }
            sidebarOrdering={{ // sidebar ordering
                'index.mdx': null,
                Documents_Group: {
                    'another.mdx': null,
                },
            }}
        >
            <Component {...pageProps} />
        </DokzProvider>
    )
}
