/*jshint es5:true*/
var avow = require('../avow');

exports.pending = function() {
	var v = avow();
	return {
		promise: v.promise,
		fulfill: v.fulfill,
		reject: v.reject
	};
};
exports.fulfilled = avow.fulfilled;
exports.rejected = avow.rejected;