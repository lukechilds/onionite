const tor = require('../lib/tor');

const orderByValues = [
  'consensus_weight',
  'first_seen'
];

module.exports = (req, res, next) => {

  let title = 'Top nodes by consensus weight';
  const query = {
    limit: 10
  };
  if(req.query.s) {
    title = `Search results for "${req.query.s}":`;
    query.search = req.query.s;
  } else {
    query.order = '-consensus_weight';
    query.running = true;
  }
  if(req.query.p) {
    query.offset = (query.limit * req.query.p) - query.limit;
  }
  if(req.query.orderBy && orderByValues.includes(req.query.orderBy)) {
    query.order = (req.query.order == 'desc') ? `-${req.query.orderBy}` : req.query.orderBy;
  }

  tor.listNodes(query)
    .then(nodes => res.render('listing.html', {
      pageTitle: req.query.s ? `Search: ${req.query.s}` : false,
      title: title,
      nodes: nodes,
      numOfNodes: query.limit,
      orderByValues: orderByValues
    }))
    .catch(err => {
      if(err.statusCode == 400 && req.query.s) {
        err.statusMessage = 'Bad Search Query';
      }
      next(err);
    });
}
