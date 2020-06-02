import { DokzProvider } from 'dokz/src'
import * as chackra from '@chakra-ui/core'
import React from 'react'

const order = { index: false, components: { Box: true } }

export default function App(props) {
    const { Component, pageProps } = props
    return (
        <DokzProvider
            playgroundScope={() =>
                import('@chakra-ui/core').then((x) => {
                    return { ...x }
                })
            }
            // playgroundScope={{...chackra}}
            sidebarOrdering={order}
        >
            <Component {...pageProps} />
        </DokzProvider>
    )
}
