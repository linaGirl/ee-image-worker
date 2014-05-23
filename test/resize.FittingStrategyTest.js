var assert = require('assert');

var resizing = require('../lib/resizing');

function resizeTo(strat, origW, origH, newW, newH, expectedW, expectedH, expectedX, expectedY){
    assert.deepEqual(
        strat.computeResizingData(origW, origH, newW, newH)
        , strat.result(expectedW, expectedH, expectedX, expectedY));
}

describe('FittingResizing', function(){
    var strat = new resizing.FittingStrategy();
    it('should preserve the same size', function(){
        resizeTo(strat, 300, 300, 300, 300, 300, 300, 0, 0);
    });

    describe('landscape', function(){
        it('should crop correctly', function(){
            resizeTo(strat, 800, 600, 800, 400, 800*400/600, 400, (800-(800*400/600))/2, 0);
        });
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
    });

    describe('portrait', function(){
       it('should shrink correctly', function(){
           resizeTo(strat, 1215, 800, 1000, 50, 1215*50/800, 50, (1000 - (1215*50/800))/2, 0);
       });
//    , testExpandPortrait: function(){
//        assert.deepEqual(this.strat.computeResizingData(600, 800, 1200, 1600), this.strat.result(1200, 1600, 0, 0));
//    }
//    , testExpandAndCropPortrait: function(){
//        assert.deepEqual(this.strat.computeResizingData(600, 800, 800, 1200), this.strat.result(900, 1200, 50, 0));
//    }
//    , testMixedMode: function(){
//        assert.deepEqual(this.strat.computeResizingData(800, 600, 100, 400), this.strat.result(533, 400, 216, 0));
//    }
    });
});