<div align='center'>
    <br/>
    <br/>
    <br/>
    <h3>Effortless documentation with Next.js and MDX
    </h3>
    <br/>
    <br/>
</div>
<br/>
<div>
Sponsored by: <a target="_blank" href="https://notaku.website">Notaku</a>
</div>
<br/>

<div>
<a target="_blank" href="https://notaku.website">
<img src="https://dokz.vercel.app/Notaku_banner.svg">
</a>
</div>

🔥 Features

-   File based routing
-   SideBar automatically generated from mdx paths
-   Table of contents generated from headings
-   Dark Mode
-   Preview React Components inside jsx code blocks
-   Can be integrated with existing Nextjs app

## Quick Start

We recommend creating a new Dokz app using `create-dokz-app`, which sets up everything automatically for you. To create a project, run:

```bash
npm init dokz-app
# or
yarn create dokz-app
```

After the installation is complete run `npm run dev` to start the development server. Try editing `pages/index.mdx` and see the result on your browser.

## Manual Setup

> warning: you should use `npm init dokz-app` if you don't have an existing next application

You can also install `dokz` in an existing nextjs application:

```bash
npm install dokz @emotion/react @chakra-ui/react @emotion/styled framer-motion
```

Add the dokz provider to the main nextjs entrypoint

```jsx
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

Add `withDokz` in the `next.config.js` file

```js
const { withDokz } = require('dokz/dist/plugin')

module.exports = withDokz()
```

Create a new mdx document inside tha `pages` folder

```md
# Heading

Ullamco ipsum id irure do occaecat minim. Cupidatat exercitation magna sit sunt aliqua voluptate excepteur amet dolor ea do. Consectetur veniam deserunt ullamco irure ullamco. Voluptate magna tempor elit voluptate velit enim dolor nulla sit fugiat exercitation. Anim deserunt Lorem aliquip cillum duis deserunt consequat sit culpa commodo.

> Node this is important

## Subjeading

Quis anim minim ullamco aliquip excepteur do pariatur eiusmod duis eu non. Duis deserunt Lorem nulla non duis voluptate dolore et. Do veniam mollit in do ad id enim anim dolore sint labore quis consequat.
```

To start developing your application run `npm run dev`. This starts the development server on `http://localhost:3000`.

Visit `http://localhost:3000` to view your application.
