var   Class 		= require('ee-class')
    , log 			= require('ee-log')
    , assert 		= require('assert')
    , FluentInterface     = require('./lib/FluentInterface')
    , FluentInterfaceStack     = require('./lib/FluentInterfaceStack')
    , picha         = require('picha')
    , strategy      = require('./lib/strategy');

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

        assert.equal(this.img.top, 200);
        assert.equal(this.img.left, 250);
        assert.equal(this.img.width, 200);
        assert.equal(this.img.height, 200);
    }
};

testCases.defaultResizing = {
    _setup: function(){
      this.strat = new strategy.DefaultResizingStrategy();
    }
    , testSameSize: function(){
        assert.deepEqual(this.strat.computeResizingData(300, 300, 300, 300), this.strat.result(300, 300, 0, 0));
    }
    , testCrop: function(){
        assert.deepEqual(this.strat.computeResizingData(800, 600, 800, 400), this.strat.result(800, 600, 0, 100));
    }
    , testShrink: function(){
        assert.deepEqual(this.strat.computeResizingData(1600, 1200, 800, 600), this.strat.result(800, 600, 0, 0));
    }
    , testShrinkAndCrop: function(){
        assert.deepEqual(this.strat.computeResizingData(1600, 600, 1200, 300), this.strat.result(1200, 450, 0, 75));
    }
    , testExpand: function(){
        assert.deepEqual(this.strat.computeResizingData(800, 600, 1600, 1200), this.strat.result(1600, 1200, 0, 0));
    }
    , testExpandAndCrop: function(){
        assert.deepEqual(this.strat.computeResizingData(800, 600, 1200, 800), this.strat.result(1200, 900, 0, 50));
    }
    , testCropPortrait: function(){
        assert.deepEqual(this.strat.computeResizingData(800, 600, 1600, 1200), this.strat.result(1600, 1200, 0, 0));
    }
    , testCropPortrait2: function(){
        assert.deepEqual(this.strat.computeResizingData(800, 1200, 800, 1000), this.strat.result(800, 1200, 0, 100));
    }
    , testShrinkPortrait: function(){
        assert.deepEqual(this.strat.computeResizingData(1200, 1600, 600, 800), this.strat.result(600, 800, 0, 0));
    }
    , testExpandPortrait: function(){
        assert.deepEqual(this.strat.computeResizingData(600, 800, 1200, 1600), this.strat.result(1200, 1600, 0, 0));
    }
    , testExpandAndCropPortrait: function(){
        assert.deepEqual(this.strat.computeResizingData(600, 800, 800, 1200), this.strat.result(900, 1200, 50, 0));
    }
    , testMixedMode: function(){
        assert.deepEqual(this.strat.computeResizingData(800, 600, 100, 400), this.strat.result(533, 400, 216, 0));
    }
};

testCases.fittingResizing = {
    _setup: function(){
        this.strat = new strategy.FittingResizingStrategy();
    }
    , _resizeTo: function(origW, origH, newW, newH, expectedW, expectedH, expectedX, expectedY){

        assert.deepEqual(
            this.strat.computeResizingData(origW, origH, newW, newH)
            , this.strat.result(expectedW, expectedH, expectedX, expectedY));
    }
    , testSameSize: function(){
        this._resizeTo(300, 300, 300, 300, 300, 300, 0, 0);
    }
    , testCrop: function(){
        this._resizeTo(800, 600, 800, 400, 800*400/600, 400, (800-(800*400/600))/2, 0);
    }
//    , testShrink: function(){
//        assert.deepEqual(this.strat.computeResizingData(1600, 1200, 800, 600), this.strat.result(800, 600, 0, 0));
//    }
//    , testShrinkAndCrop: function(){
//        assert.deepEqual(this.strat.computeResizingData(1600, 600, 1200, 300), this.strat.result(1200, 450, 0, 75));
//    }
//    , testExpand: function(){
//        assert.deepEqual(this.strat.computeResizingData(800, 600, 1600, 1200), this.strat.result(1600, 1200, 0, 0));
//    }
//    , testExpandAndCrop: function(){
//        assert.deepEqual(this.strat.computeResizingData(800, 600, 1200, 800), this.strat.result(1200, 900, 0, 50));
//    }
//    , testCropPortrait: function(){
//        assert.deepEqual(this.strat.computeResizingData(800, 600, 1600, 1200), this.strat.result(1600, 1200, 0, 0));
//    }
//    , testCropPortrait2: function(){
//        assert.deepEqual(this.strat.computeResizingData(800, 1200, 800, 1000), this.strat.result(800, 1200, 0, 100));
//    }
    , testShrinkPortrait: function(){
        this._resizeTo(1215, 800, 1000, 50, 1215*50/800, 50, (1000 - (1215*50/800))/2, 0);
    }
//    , testExpandPortrait: function(){
//        assert.deepEqual(this.strat.computeResizingData(600, 800, 1200, 1600), this.strat.result(1200, 1600, 0, 0));
//    }
//    , testExpandAndCropPortrait: function(){
//        assert.deepEqual(this.strat.computeResizingData(600, 800, 800, 1200), this.strat.result(900, 1200, 50, 0));
//    }
//    , testMixedMode: function(){
//        assert.deepEqual(this.strat.computeResizingData(800, 600, 100, 400), this.strat.result(533, 400, 216, 0));
//    }
};

testCases.fluentInterfaceStack = {
    _setup: function(){
        this.cstack = new FluentInterfaceStack();
    }
    , initialTest: function(){
        assert(!this.cstack.hasNext());
        assert(this.cstack.length === 0);
    }

    , testRepetition: function(){
        var counter = 0;
        this.cstack.push(function(){
            counter++;
            this.callNext();
        });
        this.cstack.push(function(){
            counter++;
            this.callNext();
        });
        this.cstack.execute(function(){
            counter++;
            assert.strictEqual(3, counter);
        });
        assert.equal(this.cstack.length, 0, "Length of stack should be 0 after execution");
    }
};

testCases.fluentInterface = {
    _setup: function(){
        this.cstack = new FluentInterface();
    }
    , initialTest: function(){
        assert(!this.cstack.hasNext());
        assert.strictEqual(0, this.cstack.length);
    }

    , testRepetition: function(){
        var counter = 0;
        this.cstack.push(function(){
            counter++;
            this.callNext();
        });
        this.cstack.push(function(){
            counter++;
            this.callNext();
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
            this.callNext('test', 10);
        });
        this.cstack.push(function(name, number){
            assert.strictEqual(10, number);
            assert.strictEqual('test', name);
            this.callNext(true);
        });
        this.cstack.execute(function(boolean){
            assert(boolean);
        }, 2);
    }

    , testEmpty: function(){
        this.cstack.execute(function(name){
            assert.strictEqual('yeah', name);
        }, 'yeah');
    }

    , testCallbackScope: function(){
        assert.throws(function(){
            this.cstack.execute(function(){
                this.callNext()
            });
        }.bind(this));
    }
};

for(var name in testCases){
    log.info('Running suite: '+name)
    var counter = 0,
        errorCount = 0,
        errors = [];
    for(var test in testCases[name]){
        if(test[0]!=='_'){
            try{
                testCases[name]._setup && testCases[name]._setup();
                testCases[name][test].call(testCases[name]);
            } catch (e) {
                errorCount++;
                errors.push(e)
            }
            counter++;
        }
    }
    log.info('Suite "'+name+'" threw '+errorCount+' errors ( in '+counter+' tests ):');
    for(var i=0; i<errors.length; i++){
        log(errors[i]);
    }
    log.info('');
}