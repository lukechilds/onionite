const tor = require('../../lib/tor');
const bandwidthChart = require('../../lib/bandwidth-chart');

module.exports = (request, response) => {
	Promise.all([
		tor.node(request.query.node),
		tor.bandwidth(request.query.node)
	])
		.then(data => {
			// Throw 404 if node doesn't exist
			if (!data[0]) {
				response.status(404).send('Node doesn\'t exist');
			}

			response.send({
				node: data[0],
				bandwidth: bandwidthChart(data[1])
			});
		})
		.catch(error => {
			if (error.statusCode === 400) {
				response.status(400).send('Invalid node');
			}
		});
};
