const path = require('path')
const getTableOfContents = require('mdast-util-toc')
const withTM = require('next-transpile-modules')([
    'react-landing',
    'react-landing/esm/decorations',
    'chakra-ui-forms',
    '@doks/core',
]) // pass the modules you would like to see transpiled

const {withDoks} = require('@doks/core/dist/plugin')

module.exports = withDoks(
    withTM({
        pageExtensions: ['js', 'jsx', 'md', 'mdx', 'tsx'],
        webpack: (config) => {
            return config
        },
    }),
)
