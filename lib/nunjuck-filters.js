const prettyBytes = require('pretty-bytes');

const filters = {
  bandwidth: node => `${prettyBytes(node.advertised_bandwidth)}/s`
};

module.exports = app => Object.keys(filters).forEach(filter => {
  app.settings.nunjucksEnv.addFilter(filter, filters[filter])
});
