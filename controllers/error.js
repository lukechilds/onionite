/* eslint no-unused-vars: ["error", { "argsIgnorePattern": "next" }] */
module.exports = (err, request, response, next) => {
	const statusCode = err.statusCode || 500;
	const error = err.statusMessage || 'Something went wrong';
	console.error(err);
	response.status(statusCode).render('error.html', { error });
};
