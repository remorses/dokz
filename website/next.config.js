const compose = require('compose-function')
const { withDocz } = require('dokz/dist/plugin')
const withImages = require('next-images')


const composed = compose(withDocz, withImages)

module.exports = composed({
    pageExtensions: ['js', 'jsx', 'mdx', 'tsx'],
})
