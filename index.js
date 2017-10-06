var path = require('path')
  , fs = require('fs')

var mMapHandler;
var process;

var MapHandler = function () {
  var self = this;

  var mAppMap
    , mTestMap;

  self.handleMap = function(route, callback){
    if(route && route!=null && route!='app'){
      return dirMap(route);
    }
    else {
      var processroute = require.main.filename.split('\\');
      process = processroute[processroute.length-1];
      if (process.includes('app')){
        if (mAppMap==null) {
          mAppMap = appMap(path.dirname(require.main.filename));
          return mAppMap;
        }
        else {
          return mAppMap;
        }
      }
      else if (process.includes('mocha') || process.includes('karma') || process.includes('jasmine')){
        if (mTestMap==null) {
          mTestMap = testMap();
          return mTestMap;
        }
        else {
          return mTestMap;
        }
      }
    }
  }

  self.test = function(){
    return require.main.filename;
  }

}

var createMap = function(directory, callback){
  var schema = {};
  var dirMap = fs.readdirSync(directory);
  dirMap.forEach(function(dir,i,a) {
    var dirPath = path.join(directory, dir);
    var stats = fs.lstatSync(dirPath);
    if (stats.isDirectory()) {
      createMap(dirPath, function(structure){
        schema[dir]=structure;
      });
    } else {
      var splits = dir.split('.');
      var extension = splits[splits.length - 1];
      if(extension=='js'){
        var name = dir.split('.')[0];
        schema[name]=dirPath;
      }
    }
  });
  callback(schema);
}

var appMap = function(root, callback){
  var mMap = {};
  //var root = path.dirname(require.main.filename);
  createMap(path.join(root, 'app'), function(map){
    mMap['app'] = map;
  })
  createMap(path.join(root, 'config'), function(map){
    mMap['config'] = map;
  })

  if (callback) callback(mMap);
  else return mMap;
}

var testMap = function(callback){
  var basepath = path.join(__dirname, '../../server');
  console.log("basepath: ", basepath);
  return appMap(basepath);
}

var dirMap = function(root){
  var mMap = {};
  if(!root || root==null || !root.trim().length>0) {
    return false
  }
  else {
    createMap(root, function(map){
      mMap = map;
    })
  }
  return mMap;
}

var getElement = function(package, route){
  var element = mMapHandler.handleMap().app[package];
  route.split('/').forEach(function(e){
    element = element[e];
  });
  return element;
}

var checkHandler = function(){
  if (mMapHandler==null) {
    mMapHandler = new MapHandler();
  }
}

module.exports = {

  map : function(order) {
    checkHandler();
    return mMapHandler.handleMap(order);
  },

  getConfig : function(element){
    checkHandler();
    return mMapHandler.handleMap().config[element];
  },

  getController : function(fullroute){
    checkHandler();
    return getElement('controllers', fullroute);
  },

  getService : function(fullroute){
    checkHandler();
    return getElement('services', fullroute);
  },

  getModel : function(fullroute){
    checkHandler();
    return getElement('models', fullroute);
  }

}
