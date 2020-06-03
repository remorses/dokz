const compose = require('compose-function')
const { withDokz } = require('dokz/dist/plugin')
const withTM = require('next-transpile-modules')(['dokz'])
const withImages = require('next-images')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: !!process.env.ANAL,
  })
  

const composed = compose(withBundleAnalyzer, withTM, withDokz, withImages)

module.exports = composed({
    pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
})
