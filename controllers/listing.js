const tor = require('../lib/tor');

module.exports = (req, res) => {

  let title = 'Top 10 nodes by consensus weight';
  const query = {
    limit: 10
  };
  if(req.query.s) {
    title = `Search results for "${req.query.s}":`;
    query.search = req.query.s;
    if(req.query.p) {
      query.offset = (query.limit * req.query.p) - query.limit;
    }
  } else {
    query.order = '-consensus_weight';
    query.running = true;
  }

  tor.listNodes(query)
    .then(nodes => res.render('listing.html', {
      pageTitle: req.query.s ? `Search: ${req.query.s}` : false,
      title: title,
      nodes: nodes,
      numOfNodes: query.limit
    }))
    .catch(error => res.render('listing.html', {
      error: error
    }));
}
