/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "next" }] */
module.exports = (err, req, res, next) => {
	const statusCode = err.statusCode || 500;
	const error = err.statusMessage || 'Something went wrong';
	console.error(err);
	res.status(statusCode).render('error.html', {error});
};
