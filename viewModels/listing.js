onionoo = require('onionoo');

module.exports = (req, res) => {
  onionoo
    .summary({
      limit: 10,
      order: '-consensus_weight',
      running: true
    })
    .then(summary => {
      const nodes = summary.relays.concat(summary.bridges);
      return Promise.all(nodes.map(node => onionoo.details({ lookup: node.f || node.h })));
    })
    .then(summaryDetails => {
      const nodes = summaryDetails.map(details => {
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
