import { DokzProvider } from 'dokz/src'
import * as chackra from '@chakra-ui/core'
import React from 'react'

const order = { index: null }

export default (props) => {
    const { Component, pageProps } = props
    return (
        <DokzProvider playgroundScope={{...chackra}} sidebarOrdering={order}>
            <Component {...pageProps} />
        </DokzProvider>
    )
}
