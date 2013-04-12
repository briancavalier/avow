/* Copyright (c) 2012-2013 Brian Cavalier */
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
exports.rejected = avow.reject;