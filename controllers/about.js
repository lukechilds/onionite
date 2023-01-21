module.exports = (req, res) => {
	const ONE_MONTH_IN_SECONDS = 60 * 60 * 24 * 30;
	res.setHeader('Cache-Control', `s-maxage=${ONE_MONTH_IN_SECONDS}, stale-while-revalidate`);
	res.render('about.html', {
		bodyClass: 'about',
		pageTitle: 'About'
	})
};
