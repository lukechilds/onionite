const prettyBytes = require('pretty-bytes');
const moment      = require('moment');
const querystring = require('querystring');

function humanTimeAgo(utcDate) {
  const diff = moment.utc().diff(moment.utc(utcDate));
  const uptime = {};

  uptime.s = Math.round(diff / 1000);
  uptime.m = Math.floor(uptime.s / 60);
  uptime.h = Math.floor(uptime.m / 60);
  uptime.d = Math.floor(uptime.h / 24);

  uptime.s %= 60;
  uptime.m %= 60;
  uptime.h %= 24;

  let readableUptime = '';
  readableUptime += uptime.d ? ` ${uptime.d}d` : '';
  readableUptime += uptime.h ? ` ${uptime.h}h` : '';
  readableUptime += !uptime.d || !uptime.h && uptime.m ? ` ${uptime.m}m` : '';

  return readableUptime.trim();
}

const filters = {
  bandwidth: node => `${prettyBytes(node.advertised_bandwidth)}/s`,
  uptime: node => {

    // Check node is up
    if(!node.running) {
      return 'Down';
    }

    // Check uptime
    return humanTimeAgo(node.last_restarted);
  },
  pagination: (req, direction) => {

    // Clone query string
    const query = Object.assign({}, req.query);

    // Set page as 1 by default
    query.p = query.p ? query.p : 1;

    // Update page
    if(direction == 'next') {
      query.p++;
    } else if(direction == 'prev') {
      query.p--;
    }

    // Don't add p var if it's page 1
    query.p == 1 && delete query.p

    // Encode query string
    const queryString = querystring.encode(query);
    return queryString ? `/?${queryString}` : '/';
  },
  name: node => node.nickname
    || node.fingerprint && node.fingerprint.slice(0, 8)
    || node.hashed_fingerprint && node.hashed_fingerprint.slice(0, 8),
  status: node => node.running ?
    `Up for ${humanTimeAgo(node.last_restarted)}` :
    `Down for ${humanTimeAgo(node.last_seen)}`
};

module.exports = app => Object.keys(filters).forEach(filter => {
  app.settings.nunjucksEnv.addFilter(filter, filters[filter])
});
