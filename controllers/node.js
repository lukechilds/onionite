const tor = require('../lib/tor');
const bandwidthChart = require('../lib/bandwidth-chart');

module.exports = (request, response, next) => {
	Promise.all([
		tor.node(request.params.id),
		tor.bandwidth(request.params.id)
	])
		.then(data => {
			// Throw 404 if node doesn't exist
			if (!data[0]) {
				const err = new Error('Node doesn\'t exist');
				err.statusMessage = err.message;
				err.statusCode = 404;
				throw err;
			}

			response.render('node.html', {
				pageTitle: `${data[0].type}: ${data[0].nickname}`,
				node: data[0],
				bandwidth: bandwidthChart(data[1])
			});
		})
		.catch(error => {
			if (error.statusCode === 400) {
				error.statusMessage = 'Invalid node';
			}

			next(error);
		});
};
