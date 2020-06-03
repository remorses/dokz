const compose = require('compose-function')
const { withDokz } = require('dokz/dist/plugin')

const composed = compose(withDokz)

module.exports = composed({
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
})
