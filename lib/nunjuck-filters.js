const humanize = require('humanize');

const filters = {
  bandwidth: node => `${humanize.filesize(node.advertised_bandwidth)}/s`
};

module.exports = app => Object.keys(filters).forEach(filter => {
  app.settings.nunjucksEnv.addFilter(filter, filters[filter])
});
