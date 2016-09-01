const onionoo = require('onionoo');

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

  onionoo.summary(query)
    .then(summary => {
      const nodes = summary.relays.concat(summary.bridges);
      return Promise.all(nodes.map(node => onionoo.details({ lookup: node.f || node.h })));
    })
    .then(summaryDetails => {
      const nodes = summaryDetails
        .map(details => {
          if(details.relays[0]) {
            details.relays[0].type = 'relay';
            return details.relays[0];
          } else if(details.bridges[0]) {
            details.bridges[0].type = 'bridge';
            return details.bridges[0];
          }
        });
      return res.render('listing.html', { nodes: nodes });
    });
}
