# date-log
Log messages into console AND structured files with ISO date prefix. 

Differentiate between log and error.

Connection log in different log file.

## Install and import
```shell
npm install --save date-log
```
```js
var Log = require('date-log');
```

## Usage:

date-log receives messages and/or objects and perform a console.log or console.error with a date prefix [YYYY-MM-DD HH:mm:ss]. 

It also writes down this log into a text file allocated in a folder with route equal to the date it is written.



**Example:**<br>
```shell
+ client
+ dist
- log
  - 2017
    + 09
    - 10
      - 03
        - out.log
        - err.log
        - conn.log
      - 04
        - out.log
        - err.log
        - conn.log
+ node_modules
+ server
```


## Functions:

### Log.log(string, object)
Performs console.log() of message, if given, and stringified object.

Writes the log given into out.log file.
  
### Log.error(string, object)
Performs console.error() of message, if given, and stringified object.

Writes the log given into err.log file.

### Log.connection_log(Request, string)
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
* location can return null if ip geolocalization was not possible.

It performs a log of the connection details.

It also writes this object into conn.log.



**Example:**<br>
```js
function notFound(req, res) {
  if (!whitelist.includes(req.header('Origin'))) Log.connection_log(req, 'Unexpected request');
  res.status(404).send('Access forbidden');
}
```
