const pkg = require('../package.json');

module.exports = (request, response, next) => {
	response.locals.req = request;
	response.locals.res = response;
	response.locals.version = pkg.version;
	next();
};
