const path = require('path')
const withTM = require('next-transpile-modules')([
    'react-landing',
    'chakra-ui-forms',
]) // pass the modules you would like to see transpiled
const withMDX = require('@next/mdx')({
    extension: /\.mdx?$/,
})

module.exports = withMDX(
    withTM({
        pageExtensions: ['js', 'jsx', 'md', 'mdx', 'tsx'],
        webpack: (config) => {
            return config
        },
    }),
)
