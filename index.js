var geoip = require('geoip-lite'),
    winston = require('winston'),
    fs = require('fs'),
    util = require('util');

require('winston-daily-rotate-file');

function date () {
    return '[' +
        (new Date().toISOString().replace(/T/, ' ').// replace T with a space
        replace(/\..+/, ''))     // delete the dot and everything after
        + ']';
}

function logger (filename, level) {
    return new (winston.transports.DailyRotateFile)({
        createTree: true,
        datePattern: './log/yyyy/MM/dd/',
        filename: filename,
        handleExceptions: level === 'error',
        json: false,
        level: level,
        prepend: true,
        timestamp: function () {
            return date();
        }
    });
}

var logHandler;

var LogHandler = function () {
    var self = this;

    const loggers = {
        out: new (winston.Logger)({transports: [logger('./out.log', 'info')]}),
        debug: new (winston.Logger)({transports: [logger('./debug.log', 'debug')]}),
        err: new (winston.Logger)({transports: [logger('./err.log', 'error')]}),
        conn: new (winston.Logger)({transports: [logger('./conn.log', 'info')]})
    };

    const addLogger = function (filename) {
        loggers[filename] = new (winston.Logger)({transports: [logger('./' + filename + '.log', 'info')]});
    };

    self.log = function (msg, obj, show) {
        if (typeof msg === 'object') {
            if (show) console.log(date() + ' ', msg);
            loggers.out.info(JSON.stringify(msg, null, 2));
        }
        else {
            if (show) console.log(date() + ' ' + msg, obj ? obj : '');
            loggers.out.info(msg + (obj ? JSON.stringify(obj, null, 2) : ''));
        }
    };

    self.error = function (msg, obj, show) {
        if (typeof msg === 'object') {
            if (show) console.error(date() + ' ', msg);
            loggers.err.error(JSON.stringify(msg, null, 2));
        }
        else {
            if (show) console.error(date() + ' ' + msg, obj ? obj : '');
            loggers.err.error(msg + ' ' + (obj ? JSON.stringify(obj, null, 2) : ''));
        }
    };

    self.write = function (filename, msg, obj, show) {
        if (!Object.keys(loggers).includes(filename)) {
            addLogger(filename);
        }
        if (typeof msg === 'object') {
            if (show) console.log(date() + ' ', msg);
            loggers[filename].info(JSON.stringify(msg, null, 2));
        }
        else {
            if (show) console.log(date() + ' ' + msg, obj ? obj : '');
            loggers[filename].info(msg + (obj ? JSON.stringify(obj, null, 2) : ''));
        }
    };

    self.connection_log = function (req, msg, allowed, show) {
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
        loggers.conn.info(msg + (str ? JSON.stringify(str, null, 2) : ''));
        return (str);
    };

    self.redirectConsole = function () {
        console.log("PLEASE, FOR CONSOLE LOGS TAIL 'OUT' AND 'ERR' .LOG FILES IN SERVER WITH DESIRED DATES IN FOLDER STRUCTURE");
        process.stdout.write = self.log;
        process.stderr.write = self.error;
        process.on('uncaughtException', function (err) {
            console.error((err && err.stack) ? err.stack : err);
        });
    };
};

logHandler = new LogHandler();

module.exports = logHandler;