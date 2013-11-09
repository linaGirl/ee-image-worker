var   Class 		= require('ee-class')
    , log 			= require('ee-log')
    , assert 		= require('assert');

var testCases       = {};

var ImageWorker 	= require('./');

var WorkerImage = require('./lib/WorkerImage');

testCases.crop = {
    _setup: function(){
        this.img = new WorkerImage(null, {});
    }

    , cropSingle: function(){
        assert.equal(this.img.top, 0);
        assert.equal(this.img.left, 0);
        assert.equal(this.img.width, 0);
        assert.equal(this.img.height, 0);

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
    }
};

for(var name in testCases){
    log.info('Running suite: '+name)
    for(var test in testCases[name]){
        if(test[0]!=='_'){
            try{
                testCases[name]._setup();
                testCases[name][test].call(testCases[name]);
                log.info('['+test+'] executed successfully.');
            } catch (e) {
                log.error('['+test+'] failed with message: "'+ e.message+'"')
            }
        }
    }
}