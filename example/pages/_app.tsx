import { DoczProvider } from 'dokz/src'
import React from 'react'

const order = { index: null }

export default (props) => {
    const { Component, pageProps } = props
    return (
        <DoczProvider sidebarOrdering={order}>
            <Component {...pageProps} />
        </DoczProvider>
    )
}
