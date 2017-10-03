var path = require('path')
  , geoip = require('geoip-lite')
  , winston = require('winston')
  , winstonRotator = require('winston-daily-rotate-file');

const consoleConfig = [
  new winston.transports.Console({
    'colorize': true
  })
];

const createLogger = new winston.Logger({
  'transports': consoleConfig
});

const logLogger = createLogger;
logLogger.add(winstonRotator, {
  'name': 'info-file',
  'level': 'info',
  'filename': './logs/out.log',
  'json': false,
  'datePattern': 'yyyy-MM-dd-',
  'prepend': true
});

const errLogger = createLogger;
errLogger.add(winstonRotator, {
  'name': 'error-file',
  'level': 'error',
  'filename': './logs/err.log',
  'json': false,
  'datePattern': 'yyyy-MM-dd-',
  'prepend': true
});

/*module.exports = {
  'successlog': successLogger,
  'errorlog': errorLogger
};*/


var date = function(){
  return '[' +
    (new Date().toISOString().
    replace(/T/, ' ').      // replace T with a space
    replace(/\..+/, ''))     // delete the dot and everything after
  + ']';
};

module.exports.log = function(msg, obj){
  if (typeof msg === 'object') {
    console.log(date() + ' ' , msg);
    logLogger('%s  %s', date(), msg);
  }
  else {
    console.log(date() + ' ' + msg, obj ? obj : '');
  }
};

module.exports.connection_log = function(req) {
  if (req.headers) this.log('Request Headers: ', req.headers);
  var ip = req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    req.connection.socket.remoteAddress ||
    req.ip;
  var geolocation = geoip.lookup(ip);
  var str = {
    hostname: req.hostname,
    ip: ip,
    location: geolocation ? {
      country: geolocation.country,
      city: geolocation.city,
      coords: geolocation.ll
    } : null
  };
  return (str);
};

module.exports.error = function(msg, obj){
  if (typeof msg === 'object') {
    console.error(date() + ' ' , msg);
    errLogger('%s  %s', date(), msg);
  }
  else {
    console.error(date() + ' ' + msg, obj ? obj : '');
  }
};