import App from 'next/app'
import React, { Fragment } from 'react'

import { DoksProvider } from '@doks/core/src'

export default class MyApp extends App {
    render() {
        const { Component, pageProps } = this.props
        return (
            <DoksProvider>
                <Component {...pageProps} />
            </DoksProvider>
        )
    }
}
