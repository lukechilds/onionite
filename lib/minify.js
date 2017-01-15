const minify = require('express-minify');
const minifyHTML = require('express-minify-html');
const CleanCSS = require('clean-css');

const cleanCSS = new CleanCSS();

module.exports = [
	minify({
		cssmin: source => cleanCSS.minify(source).styles
	}),
	minifyHTML({
		htmlMinifier: {
			removeComments: true,
			collapseWhitespace: true,
			collapseBooleanAttributes: true,
			removeAttributeQuotes: true,
			removeEmptyAttributes: true,
			removeOptionalTags: true
		}
	})
];
