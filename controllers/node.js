const tor = require('../lib/tor');

module.exports = (req, res, next) => {
  tor.node(req.params.id)
    .then(node => res.render('node.html', {
      node: node,
    }))
    .catch(error => res.render('node.html', {
      error: error
    }));
}
