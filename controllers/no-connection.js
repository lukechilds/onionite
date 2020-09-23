module.exports = (request, response) => response.render('no-connection.html', {
	bodyClass: 'no-connection',
	pageTitle: 'No Connection'
});
