const express = require('express');
const anonlytics = require('anonlytics-express');
const nunjucks = require('nunjucks');
const compression = require('compression');
const nunjucksFilters = require('./lib/nunjucks-filters');
const nunjucksMiddleware = require('./lib/nunjucks-middleware');
const minify = require('./lib/minify');
const controllers = require('./controllers');

const app = express();
const port = process.env.port || 3000;

// Trust proxy headers if we're deployed on now
if (process.env.NOW) {
	app.enable('trust proxy');
}

// Analytics
app.use(anonlytics());

// Setup nunjucks
nunjucks.configure('views', {express: app});
nunjucksFilters(app);
app.use(nunjucksMiddleware);

// Compress responses
app.use(compression());

// Minify responses
app.use(minify);

// Page routes
app.get('/', controllers.listing);
app.get('/node/:id', controllers.node);
app.get('/about', controllers.about);
app.get('/no-connection', controllers.noConnection);

// Serve assets with cache headers
app.use('/sw.js', express.static(`${__dirname}/public/sw.js`, {maxAge: '1 hour'}));
app.use(express.static(`${__dirname}/public`, {maxAge: '1 year'}));

// Errors
app.use(controllers.error404);
app.use(controllers.error);

// Start app
app.listen(port, () => console.log(`Onionite listening on port ${port}`));
