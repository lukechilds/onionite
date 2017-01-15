const tor = require('../lib/tor');

const orderByValues = [
  {
    name: 'Consensus Weight',
    value: 'consensus_weight'
  },
  {
    name: 'First Seen',
    value: 'first_seen'
  }
];

module.exports = (req, res, next) => {

  let title = '';
  const query = {
    limit: 10
  };
  if(req.query.s) {
    title = `Search results for "${req.query.s}":`;
    query.search = req.query.s;
  } else if(Object.keys(req.query).length == 0) {
    title = 'Top nodes by consensus weight';
    query.order = '-consensus_weight';
    query.running = true;
  }
  if(req.query.p) {
    query.offset = (query.limit * req.query.p) - query.limit;
  }
  if(req.query.orderBy && orderByValues.map(orderBy => orderBy.value).includes(req.query.orderBy)) {
    title = `Nodes ordered by "${orderByValues.find(orderBy => orderBy.value == req.query.orderBy).name}" (${req.query.order}):`;
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
