/* Copyright (c) 2012 Brian Cavalier */
(function(define) {
define(function() {

	var avow, nextTick, defaultConfig, call, fcall, undef;

	call = Function.prototype.call;
	fcall = call.bind(call);

	// Use process.nextTick or setImmediate if available, fallback to setTimeout
	nextTick = (function () {
		var globalSetTimeout = setTimeout;
		/*global setImmediate:true */
		return typeof setImmediate === 'function'
			? typeof window === 'undefined'
				   ? setImmediate
				   : setImmediate.bind(window)
			: typeof process === 'object'
				   ? process.nextTick
				   : function(task) { globalSetTimeout(task, 0); };
	}());

	// Default configuration
	defaultConfig = {
		unhandled: noop,
		handled: noop,
		protect: noop,
		nextTick: nextTick
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

		var nextTick, onHandled, onUnhandled, protect;

		// Grab the config params, use defaults where necessary
		nextTick    = config.nextTick  || defaultConfig.nextTick;
		onHandled   = config.handled   || defaultConfig.handled;
		onUnhandled = config.unhandled || defaultConfig.unhandled;
		protect     = config.protect   || defaultConfig.protect;

		// Add resolve and reject methods.
		avow.from   = from;
		avow.reject = reject;

		return avow;

		// Trusted promise constructor
		function Promise(then) {
			this.then = then;
			protect(this);
		}

		// Return a promise whose fate is determined by resolver
		function avow(resolver) {
			var value, handlers = [];

			// Call the resolver to seal the promise's fate
			try {
				resolver(promiseResolve, promiseReject);
			} catch(e) {
				promiseReject(e);
			}

			// Return the promise
			return new Promise(then);

			function then(onFulfilled, onRejected, onProgress) {
				return avow(function(resolve, reject, notify) {
					handlers
						// Call handlers later, after resolution
						? handlers.push(function(value) {
						value.then(onFulfilled, onRejected, onProgress)
							.then(resolve, reject, notify);
					})
						// Call handlers soon, but not in the current stack
						: nextTick(function() {
						value.then(onFulfilled, onRejected, onProgress)
							.then(resolve, reject, notify);
					});
				});
			}

			function promiseResolve(value) {
				resolve(from(value));
			}

			function promiseReject(reason) {
				resolve(reject(reason));
			}

			function resolve(x) {
				if(!handlers) {
					return;
				}

				value = x;
				runHandlers(handlers, value);

				handlers = undef;
			}

			function runHandlers(handlers, value) {
				nextTick(function() {
					handlers.forEach(function(handler) {
						handler(value);
					});
				});
			}
		}

		function from(x) {
			if(x instanceof Promise) {
				return x;
			} else if (x !== Object(x)) {
				return fulfilled(x);
			}

			return avow(function(resolve, reject) {
				nextTick(function() {
					try {
						// We must check and assimilate in the same tick, but not the
						// current tick, careful only to access promiseOrValue.then once.
						var untrustedThen = x.then;

						if(typeof untrustedThen === 'function') {
							fcall(untrustedThen, x, resolve, reject);
						} else {
							// It's a value, create a fulfilled wrapper
							resolve(fulfilled(x));
						}

					} catch(e) {
						// Something went wrong, reject
						reject(e);
					}
				});
			});
		}

		// Return a rejected promise
		function reject(reason) {
			return new Promise(function (_, onRejected) {
				return avow(function(resolve, reject) {
					if(typeof onRejected == 'function') {
						resolve(onRejected(reason));
					} else {
						reject(reason);
					}
				});
			});
		}

		function fulfilled(value) {
			var self = new Promise(function (onFulfilled) {
				try {
					return typeof onFulfilled == 'function' ? from(onFulfilled(value)) : self;
				} catch (e) {
					return reject(e);
				}
			});

			return self;
		}
	}

	function noop() {}

});
})(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); });