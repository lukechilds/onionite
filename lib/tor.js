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
				const details = response.body;
				details.relays.map(setNodeType('relay'));
				details.bridges.map(setNodeType('bridge'));
				return details.relays.concat(details.bridges);
			});
	},
	node: id => {
		return onionoo
			.details({ lookup: id })
			.then(response => {
				const details = response.body;
				if (details.relays[0]) {
					details.relays[0].type = 'relay';
					return details.relays[0];
				} else if (details.bridges[0]) {
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
					return lastMonth.values.map(value => value * lastMonth.factor);
				}	catch (err) {
					return [];
				}
			});
	}
};
