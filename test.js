var   Class 		= require('ee-class')
    , log 			= require('ee-log')
    , assert 		= require('assert')
    , FluentInterface     = require('./lib/FluentInterface')
    , picha         = require('picha');

var testCases       = {};
var WorkerImage = require('./lib/WorkerImage');

testCases.crop = {
    _setup: function(){
        this.img = new WorkerImage();
        // have to modify that manually for now
        this.img.width = 800;
        this.img.height = 600;
    }

    , cropSingle: function(){
        assert.equal(this.img.top, 0);
        assert.equal(this.img.left, 0);
        assert.equal(this.img.width, 800);
        assert.equal(this.img.height, 600);

        this.img.crop({top: 100, left: 200, width: 300, height: 400});

        assert.equal(this.img.top, 100);
        assert.equal(this.img.left, 200);
        assert.equal(this.img.width, 300);
        assert.equal(this.img.height, 400);

        assert.equal(this.img.length, 1);
    }

    , cropChained: function(){
        this.img.crop({top: 100, left: 200, width: 300, height: 400})
                .crop({top:100, left: 50, width: 200, height: 200});

        this.img.setWrapped(new picha.Image({data:new Buffer(0)}));

        assert.equal(this.img.top, 200);
        assert.equal(this.img.left, 250);
        assert.equal(this.img.width, 200);
        assert.equal(this.img.height, 200);

        assert.equal(this.img.length, 2);

        this.img.toBuffer(null, null, function(error){
            assert.throws(function(){
                throw error;
            },
            'Image data too small')
        });
    }
};

testCases.callstack = {
    _setup: function(){
        this.cstack = new FluentInterface();
    }
    , initialTest: function(){
        assert.strictEqual(false, this.cstack.hasNext());
        assert.strictEqual(0, this.cstack.length);
    }
    , testRepetition: function(){
        var counter = 0;
        this.cstack.push(function(){
            counter++;
            this._callNext();
        });
        this.cstack.push(function(){
            counter++;
            this._callNext();
        });
        this.cstack.execute(function(){
            counter++;
            assert.strictEqual(3, counter);
        });
    }
    , testArguments: function(){
        this.cstack.push(function(counter){
            counter++;
            assert.strictEqual(3, counter);
            this._callNext('test', 10);
        });
        this.cstack.push(function(name, number){
            assert.strictEqual(10, number);
            assert.strictEqual('test', name);
            this._callNext(true);
        });
        this.cstack.execute(function(boolean){
            assert.strictEqual(true, boolean);
        }, 2);
    }
    , testEmpty: function(){
        this.cstack.execute(function(name){
            assert.strictEqual('yeah', name);
        }, 'yeah');
    }
};

for(var name in testCases){
    log.info('Running suite: '+name)
    for(var test in testCases[name]){
        if(test[0]!=='_'){
            try{
                testCases[name]._setup && testCases[name]._setup();
                testCases[name][test].call(testCases[name]);
                log.info('['+test+'] executed successfully.');
            } catch (e) {
                log.error('['+test+'] failed:');
                log(e);
            }
        }
    }
}