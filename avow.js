(function(define) {
define(function() {
	/*jshint es5:true setImmediate:true*/

	// TODO:
	// 1. Trap unhandled rejections
	// 2. Provide a when() function

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

		make.fulfilled = fulfilled;
		make.broken = broken;

		return make;

		// Create a new, fulfilled promise
		function fulfilled(value) {
			return makePromise(function(fulfilled) {
				var v = make();
				v.fulfill(value);
				return v.promise.then(fulfilled);
			});
		}

		// Create a new, broken promise
		function broken(reason) {
			return makePromise(function(fulfilled, broken) {
				var v = make();
				v.break(reason);
				return v.promise.then(fulfilled, broken);
			});
		}

		// Create a new, pending promise
		function make() {
			var vow, pending, bind, handled;

			vow = {
				promise: makePromise(then),

				fulfill: function(value) {
					applyAllPending(applyResolve, value);
				},

				'break': function(reason) {
					if(handled === false) {
						handled = true;
						unhandled(reason);
					}
					applyAllPending(applyReject, reason);
				},
			};

			pending = [];

			bind = function(fulfilled, broken, vow) {
				pending.push(function(apply, value) {
					apply(value, fulfilled, broken, vow.fulfill, vow.break);
				});
			};

			return vow;

			function then(fulfilled, broken) {
				handled = handled || typeof broken === 'function';

				var vow = avow();
				bind(fulfilled, broken, vow);
				return vow.promise;
			}

			function applyAllPending(apply, value) {
				if(!pending) {
					return;
				}

				var bindings = pending;
				pending = undef;

				bind = function(fulfilled, broken, vow) {
					nextTick(function() {
						apply(value, fulfilled, broken, vow.fulfill, vow.break);
					});
				};

				nextTick(function() {
					bindings.forEach(function(binding) {
						binding(apply, value);
					});
				});
			}
		}

		function makePromise(then) {
			return protect({
				then: then
			});
		}

		function applyResolve(val, fulfilled, _, resolve, reject) {
			apply(val, function(val) {
				var result = fulfilled ? fulfilled(val) : val;
				if(result && typeof result.then === 'function') {
					result.then(resolve, reject);
				} else {
					resolve(result);
				}
			}, reject);
		}

		function applyReject(val, _, broken, resolve, reject) {
			apply(val, function(val) {
				if(broken) {
					var result = broken(val);
					if(result && typeof result.then === 'function') {
						result.then(resolve, reject);
					} else {
						resolve(result);
					}
				} else {
					reject(val);
				}
			}, reject);
		}
	}

	function apply(val, f, fallback) {
		try {
			f(val);
		} catch(e) {
			fallback(e);
		}
	}

	function identity(x) {
		return x;
	}

	function noop() {}

});
})(typeof define === 'function' && define.amd? define : function(factory) { module.exports = factory(); });