import fm from 'front-matter'

module.exports = async function (content) {
    const callback = this.async()

    const output = fm(content)
    // const attributes = []
    // for (const [key, value] of Object.entries(output.attributes)) {
    //     attributes.push(`export const ${key} = ${JSON.stringify(value)}`)
    // }
    // const results = `${output.body}\n\n${attributes.join('\n\n')}\n`

    return callback(null, output.body)
}
