const tor             = require('../lib/tor');
const bandwidthChart  = require('../lib/bandwidth-chart');

module.exports = (req, res, next) => {
  Promise.all([
    tor.node(req.params.id),
    tor.bandwidth(req.params.id)
  ])
    .then(data => res.render('node.html', {
      pageTitle: `${data[0].type}: ${data[0].nickname}`,
      node: data[0],
      bandwidth: bandwidthChart(data[1])
    }))
    .catch(error => res.render('node.html', {
      error: error
    }));
}
