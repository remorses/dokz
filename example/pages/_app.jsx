import { DokzProvider, GithubLink, ColorModeSwitch } from 'dokz'
import React, { Fragment } from 'react'
import Head from 'next/head'

export default function App(props) {
    const { Component, pageProps } = props
    return (
        <Fragment>
            <Head>
                <link
                    href='https://fonts.googleapis.com/css?family=Fira+Code'
                    rel='stylesheet'
                    key='google-font-Fira'
                />
            </Head>
            <DokzProvider
                headerItems={[
                    <GithubLink
                        key='0'
                        url='https://github.com/remorses/dokz'
                    />,
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
        </Fragment>
    )
}
