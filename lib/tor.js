const onionoo = require('onionoo');

module.exports = {
  listNodes: query => {
    return onionoo
      .summary(query)
      .then(summary => {
        const nodes = summary.relays.concat(summary.bridges);
        return Promise.all(nodes.map(node => module.exports.node(node.f || node.h)));
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
  },
  bandwidth: id => {
    return onionoo
      .bandwidth({ lookup: id })
      .then(bandwidth => {
        try {
          const lastMonth = bandwidth.relays[0].write_history['1_month'];
          return lastMonth.values.map(value => value * lastMonth.factor)
        }
        catch(e) {
          return [];
        }
      });
  }
};
