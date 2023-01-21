const tor = require('../lib/tor');
const bandwidthChart = require('../lib/bandwidth-chart');

module.exports = (req, res, next) => {
	Promise.all([
		tor.node(req.params.id),
		tor.bandwidth(req.params.id)
	])
		.then(data => {
			// Throw 404 if node doesn't exist
			if (!data[0]) {
				const err = new Error('Node doesn\'t exist');
				err.statusMessage = err.message;
				err.statusCode = 404;
				throw err;
			}

			const ONE_HOUR_IN_SECONDS = 60 * 60;
			res.setHeader('Cache-Control', `s-maxage=${ONE_HOUR_IN_SECONDS}, stale-while-revalidate`);
			res.render('node.html', {
				pageTitle: `${data[0].type}: ${data[0].nickname}`,
				node: data[0],
				bandwidth: bandwidthChart(data[1])
			});
		})
		.catch(err => {
			if (err.statusCode === 400) {
				err.statusMessage = 'Invalid node';
			}
			next(err);
		});
};
