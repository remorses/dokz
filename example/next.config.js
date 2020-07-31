const compose = require("compose-function");
const { withDokz } = require("dokz/dist/plugin");

const composed = compose(withDokz);

module.exports = composed({
  exportTrailingSlash: true,
  basePath: "/dokz",
  pageExtensions: ["js", "jsx", "md", "mdx", "ts", "tsx"],
});
