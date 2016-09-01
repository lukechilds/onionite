const tor = require('../lib/tor');

module.exports = (req, res) => {

  const query = {
    limit: 10
  };
  if(req.query.s) {
    query.search = req.query.s;
  } else {
    query.order = '-consensus_weight';
    query.running = true;
  }

  tor.listNodes(query).then(nodes => res.render('listing.html', {
    nodes: nodes
  }));
}
