const onionoo = require('onionoo');

module.exports = {
  listNodes: query => {
    return onionoo
      .summary(query)
      .then(summary => {
        const nodes = summary.relays.concat(summary.bridges);
        return Promise.all(nodes.map(node => onionoo.details({ lookup: node.f || node.h })));
      })
      .then(summaryDetails => {
        return summaryDetails.map(details => {
          if(details.relays[0]) {
            details.relays[0].type = 'relay';
            return details.relays[0];
          } else if(details.bridges[0]) {
            details.bridges[0].type = 'bridge';
            return details.bridges[0];
          }
        });
      });
  },
  node: id => {
    return onionoo
      .details({ lookup: id })
      .then(details => {
        if(details.relays[0]) {
          details.relays[0].type = 'relay';
          return details.relays[0];
        } else if(details.bridges[0]) {
          details.bridges[0].type = 'bridge';
          return details.bridges[0];
        }
      });
  }
};
