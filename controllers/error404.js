module.exports = (request, response) => {
	const statusCode = 404;
	const error = '404 Not Found';
	response.status(statusCode).render('error.html', { error });
};
