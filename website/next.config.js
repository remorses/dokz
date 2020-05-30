const compose = require('compose-function')
const { withDokz } = require('dokz/dist/plugin')
const withTM = require('next-transpile-modules')(['dokz'])
const withImages = require('next-images')

const composed = compose(withTM, withDokz, withImages)

module.exports = composed({
    pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
})
