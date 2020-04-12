import { DoksProvider } from '@doks/core/src'
import App from 'next/app'
import React from 'react'


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
