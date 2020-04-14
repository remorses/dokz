const compose = require('compose-function')
const { withDocz } = require('dokz/dist/plugin')

const composed = compose(withDocz)

module.exports = composed({
    pageExtensions: ['js', 'jsx', 'mdx', 'tsx'],
})
