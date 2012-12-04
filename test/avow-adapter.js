/*jshint es5:true*/
var avow = require('../avow');

exports.pending = function() {
	var pending = {};

	pending.promise = avow(function(fulfill, reject) {
		pending.fulfill = fulfill;
		pending.reject = reject;
	});

	return pending;
};
exports.fulfilled = avow.fulfilled;
exports.rejected = avow.rejected;