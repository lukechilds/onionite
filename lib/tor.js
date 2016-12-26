const Onionoo = require('onionoo');
const onionoo = new Onionoo();

module.exports = {
  listNodes: query => {
    return onionoo
      .summary(query)
      .then(response => {
        const summary = response.body;
        const nodes = summary.relays.concat(summary.bridges);
        return Promise.all(nodes.map(node => module.exports.node(node.f || node.h)));
      });
  },
  node: id => {
    return onionoo
      .details({ lookup: id })
      .then(response => {
        const details = response.body;
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
      .then(response => {
        const bandwidth = response.body;
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
