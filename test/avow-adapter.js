/* Copyright (c) 2012-2013 Brian Cavalier */
var avow = require('../avow');

exports.deferred = function(){
  var defer = {};
  defer.promise = avow(function(resolve, reject) {
	defer.resolve = resolve;
	defer.reject = reject;
  });

  return defer;
};

exports.resolved = function(value) {
  var defer = exports.deferred()
  defer.resolve(value);
  return defer.promise;
},

exports.rejected = function(reason) {
  var defer = exports.deferred()
  defer.reject(reason);
  return defer.promise;
}