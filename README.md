# xxx documentacion




// TODO add logo, nav links, footer customization via the DoksProvider
// TODO add colors customization for links via primary theme color
// TODO add github template
// TODO make cli to download the github template



@docx/core
here there is the nextjs App component, the withDoks

@docx/themes
where there re all the basic mdx components, heading, wrapper, sidebar, ...

@docx/graphql-playground

@docx/react-playground

create-doks
cli that downloads the code template from github




```js

import { DoksProvider } from '@docx/core'
import { defaultTheme } from '@docx/themes'

<DoksProvider navar={} sidebar={} footer={} tableOfContents={} h1={} h2={} {...defaultTheme} />

```


```js
const { withDoks } = require('@docx/core')
withDoks()
// scans mdx files, get their title, creates a json file with sidebar info
// uses mdx loader plugin
// add marker plugin to create a table of contents for every mdx file, inject this toc in an exported meta of the mdx file
// 
```

many built in components like

- graphql playground
- react playground
- code highlighting
- ...
