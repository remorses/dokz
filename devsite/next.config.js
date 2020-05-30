const withTM = require('next-transpile-modules')(['dokz'])
const compose = require('compose-function')
const { withDokz } = require('dokz/dist/plugin')

const composed = compose(withDokz, withTM)

module.exports = composed({
    pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
})
