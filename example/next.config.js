// const withTM = require('next-transpile-modules')(['@doks/core'])

const { withDoks } = require('@doks/core/dist/plugin')

module.exports = withDoks({
    pageExtensions: ['js', 'jsx', 'mdx'],
})
