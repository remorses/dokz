const ghpages = require("gh-pages");

ghpages.publish(
  "out",
  {
    message: "Auto-generated commit",
    // publish to origin repo if you want to have a preview (can be useful in PR review)
    remote: "origin",
    dotfiles: true,
  },
  (err) => {
    if (err) {
      console.error(`❌  There was an error publishing docs`);
      console.error(err);
      process.exit(1);
    } else {
      console.log(`✅  Docs published successfully`);
      console.log("    https://github.paypal.com/pages/imdongchen/dokz");
    }
  }
);
