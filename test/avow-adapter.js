var avow = require('./../avow');

exports.pending = function() {
	var v = avow();
	return {
		promise: v.promise,
		fulfill: v.resolve,
		reject: v.reject
	};
};
exports.fulfilled = avow.fulfilled;
exports.rejected = avow.broken;