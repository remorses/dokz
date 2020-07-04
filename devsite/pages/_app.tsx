import { DokzProvider } from 'dokz/src'
import React from 'react'
import Head from 'next/head'

const order = { '05-more': {}, '01-mongodb': true }

export default function App(props) {
    const { Component, pageProps } = props
    return (
        <>
            <Head>
                <link
                    href='https://fonts.googleapis.com/css?family=Fira+Code'
                    rel='stylesheet'
                    key='google-font-Fira'
                />
            </Head>
            <DokzProvider
                // playgroundScope={{...chackra}}
                sidebarOrdering={order}
            >
                <Component {...pageProps} />
            </DokzProvider>
        </>
    )
}
