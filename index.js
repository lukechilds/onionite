const nunjucks  = require('nunjucks');
const express   = require('express');
const app       = express();
const port      = process.env.port || 3000;

nunjucks.configure('views', { express: app });

app.get('/', (req, res) => {
  res.render('index.html');
});

app.listen(port, () => console.log(`Tor Explorer listening on port ${port}`));
