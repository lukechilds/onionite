const minify      = require('express-minify');
const minifyHTML  = require('express-minify-html');

module.exports = [
  minify(),
  minifyHTML({
    htmlMinifier: {
      removeComments:            true,
      collapseWhitespace:        true,
      collapseBooleanAttributes: true,
      removeAttributeQuotes:     true,
      removeEmptyAttributes:     true,
      removeOptionalTags:        true
    }
  })
];
