
module.exports = async function (content) {
    const callback = this.async()
    console.log(content)
    return callback(null, content)
}
