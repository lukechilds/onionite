const tor = require('../lib/tor');

module.exports = (request, response, next) => {
	let title = 'Top nodes by consensus weight';
	const query = {
		limit: 10
	};
	if (request.query.s) {
		title = `Search results for "${request.query.s}":`;
		query.search = request.query.s;
	} else {
		query.order = '-consensus_weight';
		query.running = true;
	}

	if (request.query.p) {
		query.offset = (query.limit * request.query.p) - query.limit;
	}

	tor.listNodes(query)
		.then(nodes => response.render('listing.html', {
			pageTitle: request.query.s ? `Search: ${request.query.s}` : false,
			title,
			nodes,
			numOfNodes: query.limit
		}))
		.catch(error => {
			if (error.statusCode === 400 && request.query.s) {
				error.statusMessage = 'Bad Search Query';
			}

			next(error);
		});
};
