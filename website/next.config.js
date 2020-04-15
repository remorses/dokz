const compose = require('compose-function')
const { withDokz } = require('dokz/dist/plugin')
const withImages = require('next-images')

const composed = compose(withDokz, withImages)

module.exports = composed({
    pageExtensions: ['js', 'jsx', 'mdx', 'tsx'],
})
