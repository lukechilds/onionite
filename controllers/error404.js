module.exports = (req, res) => {
	const statusCode = 404;
	const error = '404 Not Found';
	res.status(statusCode).render('error.html', { error });
};
