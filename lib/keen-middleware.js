const KeenTracking = require('keen-tracking');

const client = new KeenTracking({
  projectId: process.env.KEEN_PROJECT_ID,
  writeKey: process.env.KEEN_WRITE_KEY
});

module.exports = (req, res, next) => {
  // Record an event
  const eventData = {
    url: req.url,
    path: req.path,
    ip: req.ip,
    method: req.method,
    ips: req.ips,
    url: req.originalUrl,
    headers: req.headers,
    params: req.params,
    protocol: req.protocol,
    query: req.query,
    hostname: req.hostname
  };
  client.recordEvent('pageviews', eventData);
  next();
}
