const withTM = require('next-transpile-modules')(['dokz'])
const compose = require('compose-function')
const { withDocz } = require('dokz/dist/plugin')

const composed = compose(withDocz, withTM)

module.exports = composed({
    pageExtensions: ['js', 'jsx', 'mdx', 'tsx'],
})
