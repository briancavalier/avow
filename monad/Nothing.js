/**
 * Maybe
 * @author: brian
 */
(function(define) {
define(function() {

	var nothing;

	function Nothing() {}

	Nothing.of = function() {
		return nothing;
	}

	Nothing.prototype = {
		constructor: Nothing,

		map: function(f) {
			return nothing;
		},

		flatten: function() {
			return nothing;
		},

		chain: function(f) {
			return nothing;
		}
	};

	nothing = new Nothing();

	return Nothing;
});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(); }));
