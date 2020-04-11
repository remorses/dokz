const path = require('path')
const withTM = require('next-transpile-modules')([
    'react-landing',
    'chakra-ui-forms',
]) // pass the modules you would like to see transpiled
const withMDX = require('@next/mdx')({
    extension: /\.mdx?$/,
    options: {
        remarkPlugins: [
            () => (ast, vfile) => {
                const { cwd, contents, history } = vfile
                // TODO get the file contents, extract the toc, inject it to the contents as an exported meta const
                console.log()
            },
        ],
    },
})

module.exports = withMDX(
    withTM({
        pageExtensions: ['js', 'jsx', 'md', 'mdx', 'tsx'],
        webpack: (config) => {
            return config
        },
    }),
)
