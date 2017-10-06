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
        handleExceptions: level==='error',
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

var log = function(msg, obj) {
    if (typeof msg === 'object') {
        console.log(date() + ' ', msg);
        outLogger.info(JSON.stringify(msg, null, 2));
    }
    else {
        console.log(date() + ' ' + msg, obj ? obj : '');
        outLogger.info(msg + (obj ? JSON.stringify(obj, null, 2) : ''));
    }
};

var error = function(msg, obj) {
    if (typeof msg === 'object') {
        console.error(date() + ' ', msg);
        errLogger.error(JSON.stringify(msg, null, 2));
    }
    else {
        console.error(date() + ' ' + msg, obj ? obj : '');
        errLogger.error(msg + ' ' + (obj ? JSON.stringify(obj, null, 2) : ''));
    }
};

var connection_log = function(req, msg, allowed) {
    log(msg, allowed ? null : 'More info in conn.log');
    var str = null;
    if (!allowed) {
        if (req.headers) connLogger.info('Request Headers: ', JSON.stringify(req.headers, null, 2));
        var ip = req.headers['x-forwarded-for'] ||
            req.connection.remoteAddress ||
            req.socket.remoteAddress ||
            req.connection.socket.remoteAddress ||
            req.ip;
        var geolocation = geoip.lookup(ip);
        str = {
            hostname: req.hostname,
            ip: ip,
            location: geolocation ? {
                country: geolocation.country,
                city: geolocation.city,
                coords: geolocation.ll
            } : null
        };
    }
    console.log(date() + msg ? msg : ' ', str ? str : '');
    connLogger.info(msg + (str ? JSON.stringify(str, null, 2) : ''));
    return (str);
};

module.exports = {
    log: log,
    error: error,
    connection_log: connection_log
}