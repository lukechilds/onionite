const Onionoo = require('onionoo');
const QuickLRU = require('quick-lru');

const lru = new QuickLRU({ maxSize: 1000 });
const onionoo = new Onionoo({ cache: lru });

const setNodeType = type => node => {
	node.type = type;
	return node;
};

module.exports = {
	listNodes: query => {
		return onionoo
			.details(query)
			.then(response => {
				const relays = response.body.relays || [];
				const bridges = response.body.bridges || [];
				relays.forEach(setNodeType('relay'));
				bridges.forEach(setNodeType('bridge'));
				return relays.concat(bridges);
			});
	},
	node: id => {
		return onionoo
			.details({ lookup: id })
			.then(response => {
				const relays = response.body.relays || [];
				const bridges = response.body.bridges || [];
				if (relays[0]) {
					relays[0].type = 'relay';
					return relays[0];
				}

				if (bridges[0]) {
					bridges[0].type = 'bridge';
					return bridges[0];
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
					return lastMonth.values.map(value => value * lastMonth.factor);
				}	catch {
					return [];
				}
			});
	}
};
