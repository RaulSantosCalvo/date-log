var path = require('path')
  , geoip = require('geoip-lite')
  , winston = require('winston');

require('winston-daily-rotate-file');

var date = function() {
    return '[' +
        (new Date().toISOString().replace(/T/, ' ').// replace T with a space
        replace(/\..+/, ''))     // delete the dot and everything after
        + ']';
};

var logger = function (filename, level) {
    return new (winston.transports.DailyRotateFile)({
        createTree: true,
        datePattern: './log/yyyy/MM/dd/',
        filename: filename,
        json: false,
        level: level,
        prepend: true,
        timestamp: function () {
            return date();
        }
    });
};

var outLogger = new (winston.Logger)({ transports: [ logger('./out.log', 'info') ] });
var debugLogger = new (winston.Logger)({ transports: [ logger('./debug.log', 'debug') ] });
var errLogger = new (winston.Logger)({ transports: [ logger('./err.log', 'error') ] });
var connLogger = new (winston.Logger)({ transports: [ logger('./conn.log', 'info') ] });

module.exports.log = function(msg, obj) {
    if (typeof msg === 'object') {
        console.log(date() + ' ', msg);
        outLogger.info(JSON.stringify(msg, null, 2));
    }
    else {
        console.log(date() + ' ' + msg, obj ? obj : '');
        outLogger.info(msg + (obj ? JSON.stringify(obj, null, 2) : ''));
    }
};

module.exports.error = function(msg, obj) {
    if (typeof msg === 'object') {
        console.error(date() + ' ', msg);
        errLogger.error(JSON.stringify(msg, null, 2));
    }
    else {
        console.error(date() + ' ' + msg, obj ? obj : '');
        errLogger.error(msg + ' ' + (obj ? JSON.stringify(obj, null, 2) : ''));
    }
};

module.exports.connection_log = function(req, msg) {
    this.log("connection request")
    if (req.headers) connLogger.info('Request Headers: ', prettyjson.render(req.headers));
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
    console.log(date() + msg ? msg : ' ', str);
    connLogger.info(msg + (str ? JSON.stringify(str, null, 2) : ''));
    return (str);
};