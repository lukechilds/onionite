const rp = require('request-promise');

const baseUrl   = 'https://onionoo.torproject.org/';
const endpoints = [
  'summary',
  'details',
  'bandwidth',
  'weights',
  'clients',
  'uptime'
];

module.exports = endpoints.reduce((onionoo, endpoint) => {
  onionoo[endpoint] = args => rp({ uri: `${baseUrl}${endpoint}`, qs: args });
  return onionoo;
}, {});
