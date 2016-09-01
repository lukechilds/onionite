const nunjucks  = require('nunjucks');
const express   = require('express');
const viewModel = require('./viewModels');
const app       = express();
const port      = process.env.port || 3000;

app.set('nunjucksEnv', nunjucks.configure('views', { express: app }));

app.use((req, res, next) => {
  req.app.settings.nunjucksEnv
    .addGlobal('req', req)
    .addGlobal('res', res);

  next();
});

app.get('/', viewModel.listing);

app.listen(port, () => console.log(`Tor Explorer listening on port ${port}`));
