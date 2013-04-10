# avow

<a href="http://promises-aplus.github.com/promises-spec"><img src="http://promises-aplus.github.com/promises-spec/assets/logo-small.png" align="right" /></a>
Avow is a tiny, fast, fully asynchronous [Promises/A+](https://github.com/promises-aplus/promises-spec) implementation, and passes the [Promises/A+ Test Suite](https://github.com/promises-aplus/promises-tests).  It tracks Promises/A+ and is currently *forward compatible* to the upcoming revision Promises/A+ (likely to be versioned 1.1.0).

It's around 150 lines of JS (sans comments, module boilerplate, and nextTick sniffing), under 650 bytes when closured+gzipped, supports unhandled rejection hooks for debugging, and is very fast in environments where a fast `nextTick` is available.  It uses `process.nextTick` or `setImmediate` if available (you can use [NobleJS's setImmediate polyfill](https://github.com/NobleJS/setImmediate)), and will fall back to `setTimeout` (srsly, use the polyfill) otherwise.

## Why?

I wrote avow as a stripped-down test bed for new ideas for [when.js](https://github.com/cujojs/when), [cujo.js](http://cujojs.com)'s full-featured promise implementation.  I also hope that it serves as a simple example implementation for others who might want to implement promises either as a learning exercise, or as a part of a project/library/framework.

## Can I use it?

Yes, but you shouldn't.  You should try [when.js](https://github.com/cujojs/when) instead.  It is even faster and provides many more features, like dealing with collections of promises, competitive races, and timed promises.

## *Should* I use it?

Again, probably not.  I have no plans to support it in any way.  I'll probably change the API without warning like I did from 1.0.0 to 2.0.0.  You're on your own.

## Ok, ok, if you want to try it out

Download it, clone it, or `npm install avow`

## The API

```js
var avow = require('avow');

// Create a promise
var promise = avow(function(resolve, reject) {
	// ... do some work ...

	// Resolve the returned promise with a value, another promise,
	// or any well-behaved thenable.
	resolve(value);
	// resolve(anotherPromise);
	// resolve(thenable);

	// Or reject it
	reject(reason);
});

// Create a fulfilled promise
promise = avow.lift(nonPromiseValue);

// Create a promise whose fate follows another promise
promise = avow.lift(anotherPromise);

// Attempt to assimilate and follow a well-behaved thenable's fate
promise = avow.lift(thenable);

// Create a rejected promise that will use
promise = avow.rejected(reason);
```

## Make your own

You can make your own custom configured instance of avow:

```js
var myAvow = require('avow').construct(options);
```

Where `options` is an object that can have any of the following properties:

* `enqueue` - specify your own nextTick function
* `unhandled` - callback to be notified when a promise becomes rejected, but has no rejection handler.
* `handled` - callback to be notified if, at some point, a previously unhandled rejected promise become handled.  Since promises are temporal, this can happen if a consumer adds a rejection handler using `then()` at some point after the promise has been rejected.
* `protect` - function that is called on every promise avow creates, to give you a chance to protect it, e.g. by supplying Object.freeze() here.

## Running the Promises/A+ Test Suite

1. `npm install`
1. `npm test`

## Changelog

### 2.0.1

* Dodge Mocha `process` global
* Fix typo in Promises/A+ test adapter. Test results not affect.

### 2.0.0

* New API (I warned you!)
* Tracking forward compatibility with [Promises/A+](http://promises-aplus.github.com/promises-spec/) 1.1.0

### 1.0.0

* Initial release
* [Promises/A+](http://promises-aplus.github.com/promises-spec/) 1.0.0 compliant

## License

MIT License, Copyright (c) 2012-2013 Brian Cavalier
