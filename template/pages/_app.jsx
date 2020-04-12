import { DoczProvider } from 'dokz'
import React from 'react'

export default (props) => {
    const { Component, pageProps } = props
    return (
        <DoczProvider>
            <Component {...pageProps} />
        </DoczProvider>
    )
}
