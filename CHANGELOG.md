2.0.0

-   Updated to `@chakra-ui/react` 1 and `@emotion/react` 11 peer dependencies

-   Now you will need to wrap `DokzProvider` with `ChakraProvider` to pass correct theme:

```tsx
// _app.jsx
import { DokzProvider } from 'dokz'
import { ChakraProvider } from '@chakra-ui/react'
import React from 'react'

export default function App(props) {
    const { Component, pageProps } = props
    return (
        <ChakraProvider>
            <DokzProvider headerLogo={<img src='/logo.svg' width='100px' />}>
                <Component {...pageProps} />
            </DokzProvider>
        </ChakraProvider>
    )
}
```
