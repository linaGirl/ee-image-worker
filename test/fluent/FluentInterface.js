var assert  =   require('assert');

var fluent = require('../../lib/fluent/index');

describe('FluentInterface', function(){

    it('should do a proper setup', function(){
        var callstack = new fluent.FluentInterface();
        assert(!callstack.hasNext());
        assert.strictEqual(0, callstack.length);
    });

    it('should invoke all functions', function(){
        var callstack = new fluent.FluentInterface();
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
    });

    it('should propagate arguments', function(){
        var callstack = new fluent.FluentInterface();
        callstack.push(function(counter){
            counter++;
            assert.strictEqual(3, counter);
            this.callNext('test', 10);
        });

        callstack.push(function(name, number){
            assert.strictEqual(10, number);
            assert.strictEqual('test', name);
            this.callNext(true);
        });

        callstack.execute(function(boolean){
            assert(boolean === true);
        }, 2);
    });

    it('should directly invoke the callback if empty', function(){
        var callstack = new fluent.FluentInterface();
        callstack.execute(function(name){
            assert.strictEqual('yeah', name);
        }, 'yeah');
    });

    it('should not modify scopes', function(){
        var callstack = new fluent.FluentInterface();
        assert.throws(function(){
            callstack.execute(function(){
                this.callNext()
            });
        }.bind({}));
    });
});