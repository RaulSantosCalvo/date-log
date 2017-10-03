var path = require('path')
  , geoip = require('geoip-lite')
  , prettyjson = require('prettyjson')
  , winston = require('winston');
require('winston-daily-rotate-file');

var date = function(){
  return '[' +
    (new Date().toISOString().
    replace(/T/, ' ').      // replace T with a space
    replace(/\..+/, ''))     // delete the dot and everything after
    + ']';
};

var transport = new (winston.transports.DailyRotateFile)({
  filename: './log',
  datePattern: 'yyyy-MM-dd.',
  prepend: true,
  level: process.env.ENV === 'development' ? 'debug' : 'info'
});

var logger = function (filename, level){
  return new (winston.transports.DailyRotateFile)({
    createTree: true,
    datePattern: './log/yyyy/MM/dd/',
    filename: filename,
    json: false,
    level: level,
    prepend: true,
    timestamp: function() {
      return date();
    }
  });
}

var outLogger = new (winston.Logger)({
  transports: [ logger('./out.log', 'info') ]
});

var connLogger = new (winston.Logger)({
  transports: [ logger('./conn.log', 'info') ]
});

var errLogger = new (winston.Logger)({
  transports: [ logger('./err.log', 'error') ]
});

module.exports.log = function(msg, obj){
  if (typeof msg === 'object') {
    console.log(date() + ' ' , msg);
    outLogger.info(prettyjson.render(msg));
  }
  else {
    console.log(date() + ' ' + msg, obj ? obj : '');
    outLogger.info(msg + obj ? prettyjson.render(obj) : '');
  }
};

module.exports.connection_log = function(req, msg) {
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
  console.log(date() + msg ? msg : ' ' , str);
  connLogger.info(msg ? msg : ' ' + prettyjson.render(str));
  //return (str);
};

module.exports.error = function(msg, obj){
  if (typeof msg === 'object') {
    console.error(date() + ' ' , msg);
    errLogger.error(prettyjson.render(msg));
  }
  else {
    console.error(date() + ' ' + msg, obj ? obj : '');
    errLogger.error(msg + ' ' + obj ? prettyjson.render(obj) : '');
  }
};

