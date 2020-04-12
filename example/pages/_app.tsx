import { DoksProvider } from '@doks/core/src'
import App from 'next/app'
import React from 'react'

export default (props) => {
    const { Component, pageProps } = props
    return (
        <DoksProvider>
            <Component {...pageProps} />
        </DoksProvider>
    )
}
