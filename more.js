/* Copyright (c) 2012-2013 Brian Cavalier */
(function(define) {
define(function() {

	var setTimer, clearTimer,
		bind, uncurryThis, apply, arrayProto, forEach, map,
		undef;

	bind = Function.prototype.bind;
	uncurryThis = bind.bind(bind.call);

	apply = uncurryThis(bind.apply);
	bind = uncurryThis(bind.bind);

	arrayProto = [];
	forEach = uncurryThis(arrayProto.forEach);
	map = uncurryThis(arrayProto.map);

	if(typeof vertx === 'object') {
		setTimer = function (f, ms) { return vertx.setTimer(ms, f); };
		clearTimer = vertx.cancelTimer;
	} else {
		setTimer = setTimeout;
		clearTimer = clearTimeout;
	}

	return function construct(lift) {

		return {
			lift: lift,
			all: all,
			any: any,
			settle: settle,
			fmap: fmap,
			delay: delay,
			timeout: timeout
		};

		// Helper to "create" a pending promise using only lift
		function promise(resolver) {
			return lift({
				then: function(fulfill, reject) {
					try {
						resolver(fulfill, reject);
					} catch(e) {
						reject(e);
					}
				}
			});
		}

		// Lists of promises

		// Return a promise that will fulfill after all promises in array
		// have fulfilled, or will reject after one promise in array rejects
		function all(array) {
			return lift(array).then(function(array) {
				return promise(function(fulfill, reject) {
					var count, results;

					count = array.length;
					results = [];

					forEach(array, function(x, i) {
						lift(x).then(function(value) {
							results[i] = value;
							if(!--count) {
								fulfill(results);
							}
						}, reject);
					});
				});
			});
		}

		// Return a promise that will fulfill after one promise in array
		// is fulfilled, or will reject after all promises in array have rejected
		function any(array) {
			return lift(array).then(function(array) {
				return promise(function(fulfill, reject) {
					var count, results;

					count = array.length;
					results = [];

					forEach(array, function(x, i) {
						lift(x).then(fulfill, function(e) {
							results[i] = e;
							if(!--count) {
								reject(results);
							}
						});
					});
				});
			});
		}

		// Return a promise that will fulfill with an array of objects, each
		// with a 'value' or 'reason' property corresponding to the fulfillment
		// value or rejection reason of the
		function settle(array) {
			return lift(array).then(function(array) {
				return all(map(array, function(item) {
					return lift(item).then(toFulfilled, toRejected);
				}));
			});
		}

		// Functions

		// Return a function that accepts promises as arguments and
		// returns a promise.
		function fmap(f) {
			return function() {
				return all(arguments).then(apply.bind(f, undef));
			};
		}

		// Timed promises

		// Return a promise that delays ms before resolving
		function delay(ms, result) {
			return lift(result).then(function(result) {
				return promise(function(fulfill) {
					setTimer(bind(fulfill, undef, result), ms);
				});
			});
		}

		// Return a promise that will reject after ms if not resolved first
		function timeout(ms, trigger) {
			return promise(function(fulfill, reject) {
				var handle = setTimer(reject, ms);

				lift(trigger).then(
					function(value) {
						clearTimer(handle);
						fulfill(value);
					},
					function(reason) {
						clearTimer(handle);
						reject(reason);
					}
				);
			});
		}

	};

	function toFulfilled(x) {
		return { state: 'fulfilled', value: x };
	}

	function toRejected(x) {
		return { state: 'rejected', reason: x };
	}

});
})(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); });