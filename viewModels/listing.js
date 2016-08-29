onionoo = require('../lib/onionoo');

module.exports = (req, res) => {
  onionoo.summary({ limit: 5 })
    .then(data => res.render('listing.html', { onionoo: data }));
}
