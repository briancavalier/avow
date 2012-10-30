# avow

Avow is a very tiny, very fast, fully asynchronous promise implementation.  It is less than 150 lines of code (sans UMD boilerplate), less than 500 *bytes* when closured+gzipped, and in *very limited testing* appears to be faster than most other synchronous implementations in many cases.

It passes the Promises Test Suite, including all extensions.

## Why?

I wrote avow as a test bed for new ideas for [when.js](https://github.com/cujojs/when), [cujo.js](http://cujojs.com)'s full-featured promise implementation.  I also hope that it serves as a decent example implementation for others who might want to implement promises either as a learning exercise, or as a part of a project/library/framework.

## Can I use it?

Yes, but you shouldn't.  You should try [when.js](https://github.com/cujojs/when) instead.  It is even faster (although currently it's resolutions are synchronous), and provides many more features, like dealing with collections of promises, competitive races, and timed promises.

## *Should* I use it?

Again, probably not.  I have no plans to support it in any way.  You're on your own.

# License

MIT License, Copyright (c) 2012 Brian Cavalier