import { DoczProvider, GithubLink, ColorModeSwitch } from 'dokz/dist'
import React from 'react'

export default (props) => {
    const { Component, pageProps } = props
    return (
        <DoczProvider
            headerItems={[
                <GithubLink url='https://github.com/remorses/dokz' />,
                <ColorModeSwitch />,
            ]}
            headerLogo={
                <img
                    src='/dokz_logo.svg'
                    style={{ opacity: 0.8 }}
                    width='100px'
                />
            }
        >
            <Component {...pageProps} />
        </DoczProvider>
    )
}
