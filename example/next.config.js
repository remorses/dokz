const withTM = require('next-transpile-modules')(['@doks/core'])
const compose = require('compose-function')
const { withDoks } = require('@doks/core/dist/plugin')

const composed = compose(withDoks, withTM)

module.exports = composed({
    pageExtensions: ['js', 'jsx', 'mdx', 'tsx'],
})
