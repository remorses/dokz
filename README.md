# dokz





// TODO add colors customization for links via primary theme color
// TODO make emotion a peer dependency
// TODO remove react icons dependency, vendor svg components used
// TODO test if using a wrapper in jsx pages works
// TODO paragraph color is customizable
// TODO heading color is customizable
// TODO add a header in the sidebar, with `index` title


@docx/core
here there is the nextjs App component, the withDocz

@docx/themes
where there re all the basic mdx components, heading, wrapper, sidebar, ...

@docx/graphql-playground

@docx/react-playground

cli that downloads the code template from github




```js

import { DoczProvider } from '@docx/core'
import { defaultTheme } from '@docx/themes'

<DoczProvider navar={} sidebar={} footer={} tableOfContents={} h1={} h2={} {...defaultTheme} />

```


```js
const { withDocz } = require('@docx/core')
withDocz()
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
