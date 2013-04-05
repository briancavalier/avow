/*jshint es5:true*/
var avow = require('../avow');

exports.pending = function() {
	var pending = {};

	pending.promise = avow(function(resolve, reject) {
		pending.fulfill = resolve;
		pending.reject = reject;
	});

	return pending;
};
exports.fulfilled = avow.from;
exports.rejected = avow.rejected;