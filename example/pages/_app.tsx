import { DokzProvider } from 'dokz/src'
import React from 'react'

const order = { index: null }

export default (props) => {
    const { Component, pageProps } = props
    return (
        <DokzProvider sidebarOrdering={order}>
            <Component {...pageProps} />
        </DokzProvider>
    )
}
