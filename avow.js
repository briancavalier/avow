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
		avow.fulfilled = fulfilled;
		avow.rejected  = rejected;

		return avow;

		// Create a new, fulfilled promise
		function fulfilled(value) {
			return avow(function(fulfill) { fulfill(value); });
		}

		// Create a new, rejected promise
		function rejected(reason) {
			return avow(function(_, reject) { reject(reason); });
		}

		// Create a new, pending promise
		function avow(makePromise) {
			var promise, pending, bindHandlers, handled;

			// Queue of pending handlers, added via then()
			pending = [];

			// Arranges for handlers to be called on the eventual value or reason
			bindHandlers = function(onFulfilled, onRejected, fulfillNext, rejectNext) {
				pending.push(function(apply, value) {
					apply(value, onFulfilled, onRejected, fulfillNext, rejectNext);
				});
			};

			promise = createPromise(then);

			makePromise(
				function(value) {
					applyAllPending(applyFulfill, value);
				},
				function(reason) {
					if(handled === false) {
						handled = true;
						unhandled(reason, promise);
					}
					applyAllPending(applyReject, reason);
				}
			);

			return promise;

			// Arrange for a handler to be called on the eventual value or reason
			function then(onFulfilled, onRejected) {
				handled = handled || typeof onRejected === 'function';

				return avow(function(fulfill, reject) {
					bindHandlers(onFulfilled, onRejected, fulfill, reject);
				});
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
				bindHandlers = function(onFulfilled, onRejected, fulfillNext, rejectNext) {
					nextTick(function() {
						apply(value, onFulfilled, onRejected, fulfillNext, rejectNext);
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
		function applyReject(reason, _, onRejected, fulfillNext, rejectNext) {
			return apply(reason, onRejected, rejectNext, fulfillNext, rejectNext);
		}

		// Call a handler with value, and take the appropriate action
		// on the next promise in the chain
		function apply(val, handler, fallback, fulfillNext, rejectNext) {
			var result;
			try {
				if(typeof handler === 'function') {
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

		// Create a thenable promise
		function createPromise(then) {
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