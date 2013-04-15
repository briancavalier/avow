function identity(a) {
	return a;
}
exports.identity = identity;

function append(a, b) {
	return a.concat(b);
}
exports.append = append;

function zero(m) {
	return m.zero ? m.zero() : m.constructor.zero();
}
exports.zero = zero;

function map(m, f) {
	if(m.map) return m.map(f);
	if(m.constructor.map) return m.constructor.map(f);
	return flatMap(m, function(a) {
		return point(m, f(a));
	});
}
exports.map = map;

function flatMap(m, f) {
	return m.chain ? m.chain(f) : m.then(f);
}
exports.flatMap = flatMap;

function point(m, a) {
	return m.of ? m.of(a) : m.constructor.of(a);
}
exports.point = point;

function join(m) {
	return flatMap(m, identity);
}
exports.join = join;

function ap(a, f) {
	return flatMap(f, function(f) {
		return map(a, f);
	});
}
exports.ap = ap;

function lift2(f, a, b) {
	return ap(b, map(a, function(a) {
		return function(b) {
			return f(a, b);
		};
	}));
}
exports.lift2 = lift2;

function lift3(f, a, b, c) {
	return ap(c, ap(b, map(a, function(a) {
		return function(b) {
			return function(c) {
				return f(a, b, c);
			};
		};
	})));
}
exports.lift3 = lift3;

function lift4(f, a, b, c, d) {
	return ap(d, ap(c, ap(b, map(a, function(a) {
		return function(b) {
			return function(c) {
				return function(d) {
					return f(a, b, c, d);
				};
			};
		};
	}))));
}
exports.lift4 = lift4;