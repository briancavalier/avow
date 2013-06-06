/**
 * Simple Id Monad
 * @author: brian
 */
(function(define) {
define(function() {

	function Id(x) {
		this.value = x;
	}

	function of(x) {
		return new Id(x);
	}

	Id.of = of;

	Id.prototype = {
		constructor: Id,

		map: function(f) {
			return new Id(f(this.value));
		},

		ap: function(functor) {
			// Don't depend on knowing the internals of functor
			// Just use map
			return functor.map(this.value);
		},

		chain: function(f) {
			// Join is implicit since f returns Id
			return f(this.value);
		}
	};

	return Id;

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
