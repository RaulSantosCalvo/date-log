# date-log
Logger with ISO date prefix. Differentiate between log and error

## Install and import
```shell
npm install --save date-log
```
```js
var Log = require('date-log');
```

## Usage:

date-log receives whichever message and/or object and perform a console.log or console.error with a date prefix [YYYY-MM-DD HH:mm:ss]. 
This method can be used indirectly with other loggers or launch configurations to automatically store this oredered messages in log files.

**Example:**<br>
```shell
mkdir log/$(date \"+%F+%T\") && forever -a -l forever.log -o log/$(date \"+%F+%T\")/out.log -e log/$(date \"+%F+%T\")/err.log start dist/server/app.js
```


## Functions:

### Log.log(<string>, <object>)
Performs console.log() of message, if given, and stringified object.
  
### Log.error(<string>, <object>)
Performs console.error() of message, if given, and stringified object.

### Log.connection_log(<Request>)
When a Request object is sent, this function **returns** an object with the following structure
```js
{
  hostname: string,
  ip: string,
  location: {
    country: string,
    city: string,
    coords: []
  }
}
```
* location can return null if ip geolocalization was not possible

This can be user withing Log.log() or Log.error() to perform a log of the connection details.

**Example:**<br>
```js
function notFound(req, res) {
  if (!whitelist.includes(req.header('Origin'))) Log.log('Unexpected request', Log.connection_log(req));
  res.status(404).send('Access forbidden');
}
```
