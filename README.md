# avow

Avow is a very tiny, very fast, fully asynchronous promise implementation.  It is less than 150 lines of code (sans UMD boilerplate), less than 500 *bytes* when closured+gzipped, and is currently faster than most other synchronous implementations (including deferred, and jquery).

It passes the Promises Test Suite, including all extensions.

# Why?

I wrote avow as a proving ground for new ideas for when.js, cujo.js's full-featured promise implementation.

# Can I use it?

Yes, but you probably shouldn't.  You should try when.js instead.  It is even faster (although currently it's resolutions are synchronous), and provides many more features, like dealing with collections of promises, competitive races, and timed promises.

# *Should* I use it?

Again, probably not.  Currently, I have no plans to support it in any way.

# License

MIT License, Copyright (c) 2012 Brian Cavalier