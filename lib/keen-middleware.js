const KeenTracking = require('keen-tracking');
const responseTime = require('response-time');

const client = new KeenTracking({
  projectId: process.env.KEEN_PROJECT_ID,
  writeKey: process.env.KEEN_WRITE_KEY
});

module.exports = responseTime((req, res, time) => {

  // Setup event data
  const eventData = {
    http: {
      method: req.method,
      statusCode: res.statusCode
    },
    responseTime: time,
    url: {
      string: `${req.protocol}://${req.headers.host}${req.originalUrl}`
    },
    ip: req.ip.substr(0, 7) == '::ffff:' ? req.ip.substr(7) : req.ip,
    userAgent: {
      string: req.headers['user-agent']
    },
    referrer: {
      url: req.headers.referer
    },
    express: {
      route: req.route.path
    }
  };

  // Enable keen date time addon
  eventData.keen = {
    addons: [
      {
        name: 'keen:date_time_parser',
        input: {
          date_time: 'keen.timestamp',
        },
        output: 'timestamp_info'
      }
    ]
  };

  // Only enable other keen addons if we have the required input
  const keenAddons = [
    {
      name: 'keen:url_parser',
      input: {
        url: 'url.string'
      },
      output: 'url.components'
    },
    {
      name: 'keen:ip_to_geo',
      input: {
        ip: 'ip'
      },
      output: 'location'
    },
    {
      name: 'keen:ua_parser',
      input: {
        ua_string: 'userAgent.string'
      },
      output: 'userAgent.info'
    },
    {
      name: 'keen:referrer_parser',
      input: {
        referrer_url: 'referrer.url',
        page_url: 'url.string'
      },
      output: 'referrer.info'
    }
  ];
  keenAddons.forEach(addon => {
    const hasRequiredProperties = Object
      .keys(addon.input)
      .map(key => addon.input[key])
      .every(requiredProp => requiredProp.split('.').reduce((obj, i) => obj[i], eventData));

    if(hasRequiredProperties) {
      eventData.keen.addons.push(addon);
    }
  });

  // Send event data
  client.recordEvent('pageviewsv2', eventData);
});
