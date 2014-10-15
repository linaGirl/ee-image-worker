var assert = require('assert');

var resizing = require('../../lib/resizing/index');

describe('DefaultResizing', function(){
    var strategy = new resizing.DefaultStrategy(),
        strat = strategy;

    it('should preserve same sizes', function(){
        assert.deepEqual(
            strat.computeResizingData(300, 300, 300, 300),
            strat.result(300, 300, 0, 0));
    });

    describe('landscape', function(){

        it('should crop correctly', function(){
            assert.deepEqual(
                strat.computeResizingData(800, 600, 800, 400),
                strat.result(800, 600, 0, 100));
        });

        it('should shrink correctly', function(){
            assert.deepEqual(
                strat.computeResizingData(1600, 1200, 800, 600),
                strat.result(800, 600, 0, 0));
        });

        it('should shrink and crop correctly', function(){
            assert.deepEqual(
                strat.computeResizingData(1600, 600, 1200, 300),
                strat.result(1200, 450, 0, 75));
        });


        it('should expand correctly', function(){
            assert.deepEqual(
                strat.computeResizingData(800, 600, 1600, 1200),
                strat.result(1600, 1200, 0, 0));
        });

        it('should expand and crop correctly', function(){
            assert.deepEqual(
                strat.computeResizingData(800, 600, 1200, 800),
                strat.result(1200, 900, 0, 50));
        });

        it('should expand and crop correctly', function(){
            assert.deepEqual(
                strat.computeResizingData(800, 600, 1600, 1200),
                strat.result(1600, 1200, 0, 0));
        });

    });

    describe('portrait', function(){

        it('should crop correctly', function(){
            assert.deepEqual(
                strat.computeResizingData(800, 1200, 800, 1000),
                strat.result(800, 1200, 0, 100));
        });

        it('should shrink correctly', function(){
            assert.deepEqual(
                strat.computeResizingData(1200, 1600, 600, 800),
                strat.result(600, 800, 0, 0));
        });

        it('should expand correctly', function(){
            assert.deepEqual(
                strat.computeResizingData(600, 800, 1200, 1600),
                strat.result(1200, 1600, 0, 0));
        });

        it('should expand and crop correctly', function(){
            assert.deepEqual(
                strat.computeResizingData(600, 800, 800, 1200),
                strat.result(900, 1200, 50, 0));
        });
    });

    describe('in mixed mode', function(){

        it('should compute correct resizing data', function(){
            assert.deepEqual(
                strat.computeResizingData(800, 600, 100, 400),
                strat.result(533, 400, 216, 0));
        });
    });
});