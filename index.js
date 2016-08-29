const nunjucks  = require('nunjucks');
const express   = require('express');
const viewModel = require('./viewModels');
const app       = express();
const port      = process.env.port || 3000;

nunjucks.configure('views', { express: app });

app.get('/', viewModel.listing);

app.listen(port, () => console.log(`Tor Explorer listening on port ${port}`));
