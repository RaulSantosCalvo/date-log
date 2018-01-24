var geoip = require('geoip-lite'),
    winston = require('winston'),
    fs = require('fs'),
    util = require('util');

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
var additionalLogger = function(filename) {
    return new (winston.Logger)({ transports: [ logger('./'+filename+'.log', 'info') ] });
};

var log = function(msg, obj, show) {
    if (typeof msg === 'object') {
        if (show) console.log(date() + ' ', msg);
        outLogger.info(JSON.stringify(msg, null, 2));
    }
    else {
        if (show) console.log(date() + ' ' + msg, obj ? obj : '');
        outLogger.info(msg + (obj ? JSON.stringify(obj, null, 2) : ''));
    }
};

var error = function(msg, obj, show) {
    if (typeof msg === 'object') {
        if (show) console.error(date() + ' ', msg);
        errLogger.error(JSON.stringify(msg, null, 2));
    }
    else {
        if (show) console.error(date() + ' ' + msg, obj ? obj : '');
        errLogger.error(msg + ' ' + (obj ? JSON.stringify(obj, null, 2) : ''));
    }
};

var write = function(filename, msg, obj, show) {
    if (typeof msg === 'object') {
        if (show) console.log(date() + ' ', msg);
        additionalLogger(filename).info(JSON.stringify(msg, null, 2));
    }
    else {
        if (show) console.log(date() + ' ' + msg, obj ? obj : '');
        additionalLogger(filename).info(msg + (obj ? JSON.stringify(obj, null, 2) : ''));
    }
};

var connection_log = function(req, msg, allowed, show) {
    log(msg + (allowed ? '' : ' // More info in conn.log'));
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
    if (show) console.log(date() + msg ? msg : ' ', str ? str : '');
    connLogger.info(msg + (str ? JSON.stringify(str, null, 2) : ''));
    return (str);
};

var redirectConsole = function() {
    console.log("PLEASE, FOR CONSOLE LOGS TAIL 'OUT' AND 'ERR' .LOG FILES IN SERVER WITH DESIRED DATES IN FOLDER STRUCTURE");
    process.stdout.write = log;
    process.stderr.write = error;
    process.on('uncaughtException', function (err) {
        console.error((err && err.stack) ? err.stack : err);
    });
};

module.exports = {
    log: log,
    error: error,
    write: write,
    connection_log: connection_log,
    redirectConsole: redirectConsole
};
