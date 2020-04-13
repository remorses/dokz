import { DoczProvider } from 'dokz/src'
import App from 'next/app'
import React from 'react'

export default (props) => {
    const { Component, pageProps } = props
    return (
        <DoczProvider sidebarOrdering={{ index: null }}>
            <Component {...pageProps} />
        </DoczProvider>
    )
}
