/**
 * promiseT Monad transformer that adds promised asynchrony
 * to any Monad
 * @author: brian
 */
(function(define) {
define(function () {

	/**
	 * Makes a new Monad type, whose values are promised,
	 * from the supplied Monad constructor
	 */
	return function promiseT(Monad) {
		var mProto, aProto;

		mProto = Monad.prototype;

		function AsyncMonad(m) {
			this.value = m;
		}

		/**
		 * Lift a Monad instance into an AsyncMonad
		 * @param m
		 * @returns {promiseT.AsyncMonad}
		 */
		function lift(m) {
			return new AsyncMonad(m);
		}

		/**
		 * Wrap a promise in an AsyncMonad
		 * @param promise
		 * @returns {promiseT.AsyncMonad}
		 */
		function of(promise) {
			return lift(Monad.of(promise));
		}

		AsyncMonad.of = of;
		AsyncMonad.lift = lift;

		aProto = AsyncMonad.prototype;
		aProto.constructor = AsyncMonad;

		// Semigroup
		if(typeof mProto.concat === 'function') {
			aProto.concat = function(asyncMonad) {
				return new AsyncMonad(this.value.concat(asyncMonad.value));
			};
		}

		// Foldable
		if(typeof mProto.reduceRight === 'function') {
			aProto.reduceRight = function(f, initial) {
				return this.value.reduceRight(reducer.bind(null, f), initial);

			};
		}

		if(typeof mProto.reduce === 'function') {
			aProto.reduce = function(f, initial) {
				return this.value.reduce(reducer.bind(null, f), initial);
			};
		}

		// Functor
		if(typeof mProto.map === 'function') {
			aProto.map = function(f) {
				return new AsyncMonad(this.value.map(function(promise) {
					return promise.then(f);
				}));
			};
		}

		// Applicative
		if(typeof mProto.ap === 'function') {
			aProto.ap = function(functor) {
				var outerAsync = new AsyncMonad(this.value.map(function (promise) {
					return promise.then(function (f) {
						return functor.map(f);
					});
				}));
				return join(outerAsync);
			}
		}

		// Chain
		if(typeof mProto.chain === 'function') {
			aProto.chain = function(f) {
				var outerAsync = new AsyncMonad(this.value.map(function(promise) {
					return promise.then(f);
				}));

				return join(outerAsync);
			}
		}

		aProto.catch = function(f) {
			return new AsyncMonad(this.value.map(function(promise) {
				return promise.then(null, f);
			}));
		}

		function join(am) {
			return new AsyncMonad(am.value.map(function (promise) {
				return promise.then(extract);
			}));
		}

		function extract(wrapped) {
			// FIXME: There has to be a better way than doing
			// a closure capture to extract value from wrapped
			var value;
			wrapped.value.map(function (y) {
				value = y;
			});
			return value;
		}

		function reducer(f, a, promise) {
			return a.then(function(a) {
				return promise.then(function(x) {
					return f(a, x);
				});
			});
		}

		return AsyncMonad;
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
