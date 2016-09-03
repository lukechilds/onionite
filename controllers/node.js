const tor = require('../lib/tor');

module.exports = (req, res, next) => {
  tor.node(req.params.id).then(node => res.json(node))
}
