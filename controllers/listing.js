const tor = require('../lib/tor');

module.exports = (req, res, next) => {
	let title = 'Top nodes by consensus weight';
	const query = {
		limit: 10
	};
	if (req.query.s) {
		title = `Search results for "${req.query.s}":`;
		query.search = req.query.s;
	} else {
		query.order = '-consensus_weight';
		query.running = true;
	}
	if (req.query.p) {
		query.offset = (query.limit * req.query.p) - query.limit;
	}

	tor.listNodes(query)
		.then(nodes => {
			const ONE_HOUR_IN_SECONDS = 60 * 60;
			res.setHeader('Cache-Control', `s-maxage=${ONE_HOUR_IN_SECONDS}, stale-while-revalidate`);
			res.render('listing.html', {
				pageTitle: req.query.s ? `Search: ${req.query.s}` : false,
				title,
				nodes,
				numOfNodes: query.limit
			})
		})	
		.catch(err => {
			if (err.statusCode === 400 && req.query.s) {
				err.statusMessage = 'Bad Search Query';
			}
			next(err);
		});
};
