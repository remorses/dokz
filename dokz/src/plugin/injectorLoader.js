const { getRepoRoot } = require('get-git-config')
const path = require('path')

const runtimeClassic = `/** @jsxRuntime classic */\n`

module.exports = function (content) {
    try {
        const callback = this.async()
        // const options = this.getOptions()
        const root = getRepoRoot()
        if (!root) {
            console.log(
                `cannot find the .git directory, edit-this-page feature is disabled`,
            )
            callback(null, runtimeClassic + content)
            return
        }
        const filePath = this.resourcePath
        const editThisPagePath = path.relative(root, filePath)
        const toInject = {
            editThisPagePath,
        }
        // console.log(editThisPagePath)
        const codeToInsert = `
    \n
    if (typeof window !== 'undefined') {
        const toInject = ${JSON.stringify(toInject)};
        for (let k in toInject) {
            window[k] = toInject[k];
        }
    };\n`
        return callback(null, runtimeClassic + content + codeToInsert)
    } catch (e) {
        console.error(`got an error in edit this page loader: ${e}`)
        return callback(null, runtimeClassic + content)
    }
}
