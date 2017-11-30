const pkg = require('../package.json');

module.exports = (req, res, next) => {
	res.locals.req = req;
	res.locals.res = res;
	res.locals.version = pkg.version;
	next();
};
