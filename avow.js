/* Copyright (c) 2012 Brian Cavalier */
/*global define:true, setImmediate:true*/
(function(define) {
define(function() {

	var avow, nextTick, defaultConfig, undef;

	nextTick = typeof process === 'object' ? process.nextTick
		: typeof setImmediate === 'function' ? setImmediate
		: function(task) { setTimeout(task, 0); };

	defaultConfig = {
		nextTick: nextTick,
		unhandled: noop,
		protect: identity
	};

	avow = constructAvow(defaultConfig);
	avow.construct = constructAvow;

	return avow;

	function constructAvow(config) {

		var nextTick, unhandled, protect;

		nextTick = config.nextTick || defaultConfig.nextTick;
		unhandled = config.unhandled || defaultConfig.unhandled;
		protect = config.protect || defaultConfig.protect;

		pending.fulfilled = fulfilled;
		pending.rejected = rejected;

		return pending;

		// Create a new, fulfilled promise
		function fulfilled(value) {
			var v = pending();
			v.fulfill(value);
			return v.promise;
		}

		// Create a new, rejected promise
		function rejected(reason) {
			var v = pending();
			v.reject(reason);
			return v.promise;
		}

		// Create a new, pending promise
		function pending() {
			var vow, promise, pending, bind, handled;

			promise = makePromise(then);

			vow = {
				promise: promise,

				fulfill: function(value) {
					applyAllPending(applyFulfill, value);
				},

				reject: function(reason) {
					if(handled === false) {
						handled = true;
						unhandled(reason, promise);
					}
					applyAllPending(applyReject, reason);
				}
			};

			pending = [];

			bind = function(onFulfilled, onRejected, vow) {
				pending.push(function(apply, value) {
					apply(value, onFulfilled, onRejected, vow.fulfill, vow.reject);
				});
			};

			return vow;

			function then(onFulfilled, onRejected) {
				handled = handled || typeof onRejected === 'function';

				var vow = avow();
				bind(onFulfilled, onRejected, vow);
				return vow.promise;
			}

			function applyAllPending(apply, value) {
				if(!pending) {
					return;
				}

				var bindings = pending;
				pending = undef;

				bind = function(onFulfilled, onRejected, vow) {
					nextTick(function() {
						apply(value, onFulfilled, onRejected, vow.fulfill, vow.reject);
					});
				};

				nextTick(function() {
					bindings.forEach(function(binding) {
						binding(apply, value);
					});
				});
			}
		}

		function applyFulfill(val, onFulfilled, _, fulfillNext, rejectNext) {
			return apply(val, onFulfilled, fulfillNext, fulfillNext, rejectNext);
		}

		function applyReject(val, _, onRejected, fulfillNext, rejectNext) {
			return apply(val, onRejected, rejectNext, fulfillNext, rejectNext);
		}

		function apply(val, handler, fallback, fulfillNext, rejectNext) {
			var result;
			try {
				if(handler) {
					result = handler(val);
					if(result && typeof result.then === 'function') {
						result.then(fulfillNext, rejectNext);
					} else {
						fulfillNext(result);
					}

				} else {
					fallback(val);
				}
			} catch(e) {
				rejectNext(e);
			}
		}

		function makePromise(then) {
			return protect({
				then: then
			});
		}
	}

	function identity(x) {
		return x;
	}

	function noop() {}

});
})(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); });