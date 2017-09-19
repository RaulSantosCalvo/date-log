var path = require('path')
  , geoip = require('geoip-lite');

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
  }
  else {
    console.error(date() + ' ' + msg, obj ? obj : '');
  }
};