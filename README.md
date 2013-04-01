# avow

Avow is a very tiny, very fast, fully asynchronous [Promises/A+](https://github.com/promises-aplus/promises-spec) implementation, and passes the [Promises/A+ Test Suite](https://github.com/promises-aplus/promises-tests).

It is less than 150 lines of code (sans comments and UMD boilerplate), less than 500 *bytes* when closured+gzipped, and in *very limited testing* appears to be as fast as or faster than most other synchronous implementations in environments where a fast `nextTick` is available.  It uses `process.nextTick` or `setImmediate` if available (you can use [NobleJS's setImmediate polyfill](https://github.com/NobleJS/setImmediate)), and will fall back to `setTimeout` (srsly, use the polyfill) otherwise.

## Why?

I wrote avow as a stripped-down test bed for new ideas for [when.js](https://github.com/cujojs/when), [cujo.js](http://cujojs.com)'s full-featured promise implementation.  I also hope that it serves as a simple example implementation for others who might want to implement promises either as a learning exercise, or as a part of a project/library/framework.

## Can I use it?

Yes, but you shouldn't.  You should try [when.js](https://github.com/cujojs/when) instead.  It is even faster (although currently its resolutions are synchronous), and provides many more features, like dealing with collections of promises, competitive races, and timed promises.

## *Should* I use it?

Again, probably not.  I have no plans to support it in any way.  I'll probably change the API without warning.  You're on your own.

## Ok, ok, if you want to try it out

Download it, clone it, or `npm install git://github.com/briancavalier/avow.git`

## The API

```js
var avow = require('avow');

// Create a promise
var promise = avow(function(fulfill, reject) {
	// ... do some work ...

	// Fulfill the returned promise
	fulfill(value);

	// Or reject it
	reject(reason);
});

// Create a fulfilled promise
vow = avow.fulfilled(value);

// Create a rejected promise
vow = avow.rejected(reason);
```

## Make your own

You can make your own custom configured instance of avow:

```js
var myAvow = require('avow').construct(options);
```

Where `options` is an object that can have any of the following properties:

* `nextTick` - specify your own nextTick function
* `unhandled` - callback to be notified when an unhandled rejection reaches the end of a promise chain.
* `protect` - function that is called on every promise avow creates, to give you a chance to protect it, e.g. by supplying Object.freeze() here.

## Running the Promises/A+ Test Suite

1. `npm install`
1. `npm test`

## License

MIT License, Copyright (c) 2012 Brian Cavalier