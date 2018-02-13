# date-log
Log messages into structured files with ISO date prefix. 

4 default files available. Possibility to generate own log files.

Connection log in different log file.

## Install and import
```shell
npm install --save date-log
yarn add date-log
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

### Log.redirectConsole()
From the moment this function is called, every console.log or console.error will be redirected to Log.log and Log.error respectively.

Recommended for production deployment.

### Log.log(message: string, obj: object, show: boolean)
Writes the given string message, if any, and the stringified object into out.log file.

If show flag is passed, it also sends the message to console.log (for developing purposes)

### Log.error(message: string, obj: object, show: boolean)
Writes the given string message, if any, and the stringified object into err.log file.

If show flag is passed, it also sends the message to console.error (for developing purposes)

### Log.write(filename: string, message: string, obj: object, show: boolean)
Writes the log given string message, if any, and the stringified object into <filename>.log file.

If show flag is passed, it also sends the message to console.error (for developing purposes)

The log file with given name remains open for further usage.

### Log.connection_log(req: Request, message: string, allowed: boolean, show: boolean)
If allowed is true, this function logs the connection was succesful.

Else, it uses the Request object sent to create a log of the connection details. Then it **returns** an object with the following structure
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

It also writes this object into conn.log.



**Example:**<br>
```js
function notFound(req, res) {
  if (!whitelist.includes(req.header('Origin'))) {
      Log.connection_log(req, 'Unexpected request');
  }
  res.status(404).send('Access forbidden');
}
```
