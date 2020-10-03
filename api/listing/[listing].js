const tor = require('../../lib/tor');
const bandwidthChart = require('../../lib/bandwidth-chart');

module.exports = (request, response) => {
	const query = {
		limit: 10
	};
	const decoded = decodeURIComponent(request.query.listing);
	const split = decoded.split(':');
	const query0 = split[0];
	const query1 = split.slice(1).join(':');
	if (query0 && query0.startsWith('s')) {
		query.search = query0.slice(1);
	} else if (query1 && query1.startsWith('s')) {
		query.search = query1.slice(1);
	} else {
		query.order = '-consensus_weight';
		query.running = true;
	}

	if (query0 && query0.startsWith('p')) {
		query.offset = (query.limit * query0.slice(1)) - query.limit;
	}

	if (query1 && query1.startsWith('p')) {
		query.offset = (query.limit * query1.slice(1)) - query.limit;
	}

	let i = 0;
	tor.listNodes(query)
		.then(nodes => {
			if (nodes.length === 0) {
				response.send({ nodes: {} });
			}

			nodes.forEach(node => {
				tor.bandwidth(node.fingerprint).then(bandwidth => {
					node.bandwidth = bandwidthChart(bandwidth);
					i++;
					if (i === nodes.length || i > 9) {
						response.send(nodes);
					}
				});
			});
		}
		);
};
