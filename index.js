const nunjucks            = require('nunjucks');
const express             = require('express');
const nunjucksFilters     = require('./lib/nunjucks-filters');
const nunjucksMiddleware  = require('./lib/nunjucks-middleware');
const compression         = require('compression');
const minify              = require('./lib/minify');
const controllers         = require('./controllers');
const app                 = express();
const port                = process.env.port || 3000;

// Setup nunjucks
nunjucks.configure('views', { express: app });
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
app.use(express.static(`${__dirname}/public`, { maxAge: '1 year' }));

// Start app
app.listen(port, () => console.log(`Tor Explorer listening on port ${port}`));
