/* Copyright (c) 2012-2014 Brian Cavalier */
(function(define, global) {
define(function() {

	var avow, enqueue, defaultConfig, setTimeout, bind, uncurryThis, call, undef;

	bind = Function.prototype.bind;
	uncurryThis = bind.bind(bind.call);
	call = uncurryThis(bind.call);

	// Prefer setImmediate, cascade to node, vertx and finally setTimeout
	/*global setImmediate,process,vertx*/
	setTimeout = global.setTimeout;
	enqueue = typeof setImmediate === 'function' ? setImmediate.bind(global)
		: typeof process === 'object' && process.nextTick ? process.nextTick
		: typeof vertx === 'object' ? vertx.runOnLoop // vert.x
			: function(task) { setTimeout(task, 0); }; // fallback

	// Default configuration
	defaultConfig = {
		enqueue:   enqueue,
		unhandled: noop,
		handled:   noop,
		protect:   noop
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

		var enqueue, onHandled, onUnhandled, protect;

		// Grab the config params, use defaults where necessary
		enqueue     = config.enqueue   || defaultConfig.enqueue;
		onHandled   = config.handled   || defaultConfig.handled;
		onUnhandled = config.unhandled || defaultConfig.unhandled;
		protect     = config.protect   || defaultConfig.protect;

		// Add lift and reject methods.
		promise.lift    = lift;
		promise.reject  = reject;

		return promise;

		// Return a trusted promise for x.  Where if x is a
		// - Promise, return it
		// - value, return a promise that will eventually fulfill with x
		// - thenable, assimilate it and return a promise whose fate follows that of x.
		function lift(x) {
			return promise(function(resolve) {
				resolve(x);
			});
		}

		// Return a rejected promise
		function reject(reason) {
			return promise(function(_, reject) {
				reject(reason);
			});
		}

		// Return a pending promise whose fate is determined by resolver
		function promise(resolver) {
			var self, value, handled, handlers = [];

			self = new Promise(then);

			// Call the resolver to seal the promise's fate
			try {
				resolver(promiseResolve, promiseReject);
			} catch(e) {
				promiseReject(e);
			}

			// Return the promise
			return self;

			// Register handlers with this promise
			function then(onFulfilled, onRejected) {
				if (!handled) {
					handled = true;
					onHandled(self);
				}

				return promise(function(resolve, reject) {
					handlers
						// Call handlers later, after resolution
						? handlers.push(function(value) {
							value.then(onFulfilled, onRejected).then(resolve, reject);
						})
						// Call handlers soon, but not in the current stack
						: enqueue(function() {
							value.then(onFulfilled, onRejected).then(resolve, reject);
						});
				});
			}

			// Resolve with a value, promise, or thenable
			function promiseResolve(value) {
				if(!handlers) {
					return;
				}

				resolve(coerce(value));
			}

			// Reject with reason verbatim
			function promiseReject(reason) {
				if(!handlers) {
					return;
				}

				if(!handled) {
					onUnhandled(self, reason);
				}

				resolve(rejected(reason));
			}

			// For all handlers, run the Promise Resolution Procedure on this promise
			function resolve(x) {
				var queue = handlers;
				handlers = undef;
				value = x;

				enqueue(function () {
					queue.forEach(function (handler) {
						handler(value);
					});
				});
			}
		}

		// Private

		// Trusted promise constructor
		function Promise(then) {
			this.then = then;
			protect(this);
		}

		// Coerce x to a promise
		function coerce(x) {
			if(x instanceof Promise) {
				return x;
			} else if (x !== Object(x)) {
				return fulfilled(x);
			}

			return promise(function(resolve, reject) {
				enqueue(function() {
					try {
						// We must check and assimilate in the same tick, but not the
						// current tick, careful only to access promiseOrValue.then once.
						var untrustedThen = x.then;

						if(typeof untrustedThen === 'function') {
							// Prevent thenable self-cycles
							call(untrustedThen, x, function(result) {
								resolve(result === x ? fulfilled(x) : result);
							}, reject);
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

		// create an already-fulfilled promise used to break assimilation recursion
		function fulfilled(x) {
			var self = new Promise(function (onFulfilled) {
				try {
					return typeof onFulfilled == 'function'
						? coerce(onFulfilled(x)) : self;
				} catch (e) {
					return rejected(e);
				}
			});

			return self;
		}

		// create an already-rejected promise
		function rejected(x) {
			var self = new Promise(function (_, onRejected) {
				try {
					return typeof onRejected == 'function'
						? coerce(onRejected(x)) : self;
				} catch (e) {
					return rejected(e);
				}
			});

			return self;
		}
	}

	function noop() {}

});
})(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }, this);
