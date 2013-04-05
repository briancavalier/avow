assert = require('assert');
avow = require('../avow');
describe("using reduce to sum integers using promises", function(){
  it("should build the promise pipeline without error", function(){
    var array = [];
    var iters = 1000;
    for (var i=1; i<=iters; i++)
      array.push(i)
    var pZero = avow();
    pZero.fulfill(0)
    var result = array.reduce(function(promise, nextVal) {
      return promise.then(function(currentVal) {
        var pNext = avow();
        pNext.fulfill(currentVal + nextVal);
        return pNext.promise;
      });
    }, pZero.promise);
  });
  it("should get correct answer without blowing the nextTick stack", function(done){
    var pZero = avow();
    pZero.fulfill(0)
    var array = [];
    var iters = 1000;
    for (var i=1; i<=iters; i++)
      array.push(i)
    var result = array.reduce(function(promise, nextVal) {
      return promise.then(function(currentVal) {
        var pNext = avow();
        pNext.fulfill(currentVal + nextVal);
        return pNext.promise;
      });
    }, pZero.promise);
    result.then(function(value){
      assert.equal(value, (iters*(iters+1)/2));
      done();
    });
  });
});
