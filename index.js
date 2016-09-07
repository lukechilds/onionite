const nunjucks            = require('nunjucks');
const express             = require('express');
const nunjucksFilters     = require('./lib/nunjucks-filters');
const nunjucksMiddleware  = require('./lib/nunjucks-middleware');
const compression         = require('compression');
const controllers         = require('./controllers');
const app                 = express();
const port                = process.env.port || 3000;

// Setup nunjucks
nunjucks.configure('views', { express: app });
nunjucksFilters(app);
app.use(nunjucksMiddleware);

// Compress responses
app.use(compression());

// Page routes
app.get('/', controllers.listing);
app.get('/node/:id', controllers.node);

// Serve assets with cache headers
app.use('/assets', express.static(`${__dirname}/assets`, { maxAge: '1 year' }));

// Start app
app.listen(port, () => console.log(`Tor Explorer listening on port ${port}`));
