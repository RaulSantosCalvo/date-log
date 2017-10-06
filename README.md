## folder-mapper
Map your application from app base file of from a given directory.
This map is created following a MEAN stack based on JAVA development structure.

**Structure example:**<br>
```js
+ app
  + controllers
    + api
      - dogs
      - cats
    + mqtt
      - broadcast
    + websocket
      - chat
  + models
    - dog
    - cat
    - message
  + services
    - dogs
    - cats
    - messages
+ config
  - config
  - mqtt
  - routes
  - websocket
- app.js
```

**Example:**<br>
```js
map = {
 app : {
  controllers : {
   api : {
    dogs : "route_to_your_application/app/controllers/api/dogs.js"
(...) 
```


## Install and import
```shell
npm install --save folder-mapper
```
```js
var map = require('folder-mapper');
```


## Usage:

When you use any function given by the map handler an internal object is created with the folder structure and absolute routes of the files in your application. This object is stored for fast interaction.


## Functions:

### map.map(<your_route>)

this function returns a personal map of the requested folder. Is commonly used as map.map(__dirname) to know about the same file location.

At the moment of creating the object, the function gets the application running environment. In case it is the normal application, it stores de object from the app.js file, if it is from application/server or application/dist/server (for production environments).
In case it is a test environment (mocha, karma, jasmine) it stores the object from the app.js file located in application/server, to make the requires in every file be able to pass the tests.


### map.map() or map.map('app')

this function returns the full app object, based on your environment. This javascript object can be used and iterated as a JSON object.

### map.getModel(<route>)
### map.getService(<route>)
### map.getController(<route>)
  
these functions give the route to the file located in the package for the end route given.

example: map.getModel('dog') => route_to_your_application/app/models/dog.js
example: map.getModel('bigger_application/dog') => route_to_your_application/app/models/bigger_application/dog.js


### map.getConfig(<file>)
  
this function gives the route to the configuration file requested

example: map.getConfig('config') => route_to_your_application/config/config.js
