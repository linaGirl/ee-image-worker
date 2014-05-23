var   assert 		= require('assert')

var fluent          = require('../lib/fluent');

describe('FluentStack', function(){

    it('should do a proper setup', function(){
        var callstack = new fluent.FluentStack();
        assert(!callstack.hasNext());
        assert(callstack.length === 0);
    });

    it('should repeat properly and be empty after execution', function(){
        var callstack = new fluent.FluentStack();
        var counter = 0;
        callstack.push(function(){
            counter++;
            this.callNext();
        });
        callstack.push(function(){
            counter++;
            this.callNext();
        });
        callstack.execute(function(){
            counter++;
            assert.strictEqual(3, counter);
        });

        assert.equal(callstack.length, 0, "Length of stack should be 0 after execution");
    });
});
