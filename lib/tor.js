const Onionoo = require('onionoo');
const onionoo = new Onionoo({ baseUrl: 'https://onionoo.thecthulhu.com' });

module.exports = {
  listNodes: query => {
    return onionoo
      .details(query)
      .then(response => {
        const details = response.body;
        details.relays.forEach(node => node.type = 'relay');
        details.bridges.forEach(node => node.type = 'bridge');
        return details.relays.concat(details.bridges);
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
