const nunjucks        = require('nunjucks');
const express         = require('express');
const nunjucksFilters = require('./lib/nunjucks-filters');
const controllers     = require('./controllers');
const app             = express();
const port            = process.env.port || 3000;

app.set('nunjucksEnv', nunjucks.configure('views', { express: app }));
nunjucksFilters(app);

app.use((req, res, next) => {
  req.app.settings.nunjucksEnv
    .addGlobal('req', req)
    .addGlobal('res', res);

  next();
});

app.get('/', controllers.listing);
app.get('/node/:id', controllers.node);

app.listen(port, () => console.log(`Tor Explorer listening on port ${port}`));
