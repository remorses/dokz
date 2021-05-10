#!/bin/bash
yarn run compile
npm version patch && npm publish --access public
git commit -am 'published new version'
git push
