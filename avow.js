/* Copyright (c) 2012 Brian Cavalier */
(function(define) {
define(function() {

	var avow, nextTick, defaultConfig, undef;

	// Use process.nextTick or setImmediate if available, fallback to setTimeout
	nextTick = typeof process === 'object' ? process.nextTick
		: typeof setImmediate === 'function' ? setImmediate
		: function(task) { setTimeout(task, 0); };

	// Default configuration
	defaultConfig = {
		nextTick: nextTick,
		unhandled: noop,
		protect: identity
	};

	// Create the default module instance
	// This is what you get when you require('avow')
	avow = constructAvow(defaultConfig);

	// You can use require('avow').construct(options) to
	// construct a custom configured version of avow
	avow.construct = constructAvow;

	return avow;

	// This constructs configured instances of the avow module
	function constructAvow(config) {

		var nextTick, unhandled, protect;

		// Grab the config params, use defaults where necessary
		nextTick = config.nextTick || defaultConfig.nextTick;
		unhandled = config.unhandled || defaultConfig.unhandled;
		protect = config.protect || defaultConfig.protect;

		// Add fulfilled and rejected methods. see below
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
			var vow, promise, pending, bindHandlers, handled;

			promise = makePromise(then);

			// Create a vow, which has a pending promise plus methods
			// for fulfilling and rejecting the promise
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

			// Queue of pending handlers, added via then()
			pending = [];

			// Arranges for handlers to be called on the eventual value or reason
			bindHandlers = function(onFulfilled, onRejected, vow) {
				pending.push(function(apply, value) {
					apply(value, onFulfilled, onRejected, vow.fulfill, vow.reject);
				});
			};

			return vow;

			// Arrange for a handler to be called on the eventual value or reason
			function then(onFulfilled, onRejected) {
				handled = handled || typeof onRejected === 'function';

				var vow = avow();
				bindHandlers(onFulfilled, onRejected, vow);
				return vow.promise;
			}

			// When the promise is fulfilled or rejected, call all pending handlers
			function applyAllPending(apply, value) {
				// Already fulfilled or rejected, ignore silently
				if(!pending) {
					return;
				}

				var bindings = pending;
				pending = undef;

				// The promise is no longer pending, so we can swap bindHandlers
				// to something more direct
				bindHandlers = function(onFulfilled, onRejected, vow) {
					nextTick(function() {
						apply(value, onFulfilled, onRejected, vow.fulfill, vow.reject);
					});
				};

				// Call all the pending handlers
				nextTick(function() {
					bindings.forEach(function(binding) {
						binding(apply, value);
					});
				});
			}
		}

		// Call fulfilled handler and forward to the next promise in the chain
		function applyFulfill(val, onFulfilled, _, fulfillNext, rejectNext) {
			return apply(val, onFulfilled, fulfillNext, fulfillNext, rejectNext);
		}

		// Call rejected handler and forward to the next promise in the chain
		function applyReject(val, _, onRejected, fulfillNext, rejectNext) {
			return apply(val, onRejected, rejectNext, fulfillNext, rejectNext);
		}

		// Call a handler with value, and take the appropriate action
		// on the next promise in the chain
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

		// Make a thenable promise
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