var   Class 		= require('ee-class')
    , log 			= require('ee-log')
    , assert 		= require('assert')
    , CallStack     = require('./lib/CallStack');

var testCases       = {};

var ImageWorker 	= require('./');

var WorkerImage = require('./lib/WorkerImage');

testCases.crop = {
    _setup: function(){
        this.img = new WorkerImage(null, {});
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

        assert.equal(this.img.actions.length, 1);
    }

    , cropChained: function(){
        this.img.crop({top: 100, left: 200, width: 300, height: 400})
                .crop({top:100, left: 50, width: 200, height: 200});

        assert.equal(this.img.top, 200);
        assert.equal(this.img.left, 250);
        assert.equal(this.img.width, 200);
        assert.equal(this.img.height, 200);

        assert.equal(this.img.actions.length, 2);

        console.log(this.img.actions);
    }

    , cropChainedInvalid: function(){
        assert.throws(function(){
            this.img.crop({top: 400, left: 400, width: 500})
        }.bind(this), Error);
    }
};

testCases.callstack = {
    _setup: function(){
        this.cstack = new CallStack();
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
                log.error('['+test+'] failed with message: "'+ e.message+'"')
            }
        }
    }
}