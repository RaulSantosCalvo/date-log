var path = require('path')
  , geoip = require('geoip-lite')
  , winston = require('winston');
require('winston-daily-rotate-file');


var mLogger;

var LoggerHandler = function (){

  var self = this;

  var outLogger = new (winston.Logger)({
    transports: [
      new (winston.transports.DailyRotateFile)({
        createTree: true,
        datePattern: './log/yyyy/MM/dd/',
        filename: './out.log',
        json: false,
        level: 'info',
        name: 'info',
        prepend: true
      })
    ]
  });

  var errLogger = new (winston.Logger)({
    transports: [
      new (winston.transports.DailyRotateFile)({
        createTree: true,
        datePattern: './log/yyyy/MM/dd/',
        filename: './err.log',
        json: false,
        level: 'error',
        name: 'error',
        prepend: true
      })
    ]
  });

  self.log = function(s){
    console.log("log!");
    outLogger.info("log!");
  }

  self.err = function(s){
    console.log("err!");
    errLogger.error("log!");
  }

}

var date = function(){
  return '[' +
    (new Date().toISOString().
    replace(/T/, ' ').      // replace T with a space
    replace(/\..+/, ''))     // delete the dot and everything after
  + ']';
};

module.exports.log = function(msg, obj){
  if (!mLogger) mLogger = new LoggerHandler();
  if (typeof msg === 'object') {
    console.log("esto es un log");

    var s = ''+date()+' '+JSON.stringify(msg);
    console.log("s: ", s);

    mLogger.log(s);

    //console.log(date() + ' ' , msg);
    console.log("outLogger: ");
    console.log("outLogger: ", outLogger);
    outLogger.info(s);
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
  if (!mLogger) mLogger = new LoggerHandler();
  if (typeof msg === 'object') {
    console.error(date() + ' ' , msg);
    errLogger.error('%s  %s', date(), msg);
    mLogger.err(msg);
  }
  else {
    console.error(date() + ' ' + msg, obj ? obj : '');
  }
};

var start = function (){
  if (!mLogger) mLogger = new LoggerHandler();
  mLogger.log(date()+' Hello World!');
  mLogger.err(date()+' No World!');
}
start();