var avow, fl;

avow = require('../avow');
fl = require('./fantasy-land');

fl.lift2(console.log, avow.of(123), avow.of(456));
fl.lift2(console.log, avow.from(123), avow.from(456));

fl.lift2(console.log, avow.of(avow.of(123)), avow.of(avow.of(456)));
fl.lift2(console.log, avow.from(avow.of(123)), avow.from(avow.of(456)));