/**
 * Maybe
 * @author: brian
 */
(function(define) {
define(function(require) {

	return {
		Just: require('./Id'),
		Nothing: require('./Nothing')
	};

});
}(typeof define === 'function' && define.amd ? define : function(factory) { module.exports = factory(require); }));
