"use strict";

var   assert    = require('assert')
    , log       = require('ee-log')
    , Bounds    = require('../lib/engine/abstract/Bounds');

function assertBounds(bound, width, height, focusX, focusY){
    assert.equal(bound.width, width);
    assert.equal(bound.height, height);
    if(focusX){
        assert.equal(bound.focus.x, focusX);
    }
    if(focusY){
        assert.equal(bound.focus.y, focusY);
    }
}

describe('Bounds', function(){

    var   portrait  = new Bounds(600, 1200)
        , landscape = new Bounds(1920, 1080)
        , square    = new Bounds(400, 400.459);


    it('should do a proper setup', function(){
        assertBounds(portrait, 600, 1200);
        assertBounds(landscape, 1920, 1080);
    });

    it('also if the passed values are floats', function(){
        assertBounds(square, 400, 400);
    });

    describe('.aspectRatio', function(){
       it('should return correct ratios', function(){
           assert.equal(portrait.aspectRatio(), 0.5);
           assert(landscape.aspectRatio() > 1);
           assert.equal(square.aspectRatio(), 1);
       }) ;
    });

    describe('.isLandscape/isPortrait', function(){
        it('should return a correct boolean', function(){
            assert(portrait.isPortrait());
            assert(!portrait.isLandscape());

            assert(!landscape.isPortrait());
            assert(landscape.isLandscape());

            assert(!square.isLandscape());
            assert(square.isPortrait());
        });
    });

    describe('.clone', function(){
       it('should correctly clone the bounds', function(){

           var cloned = portrait.clone();
           assert.notStrictEqual(portrait, cloned);

           assert.equal(portrait.width, cloned.width);
           assert.equal(portrait.height, cloned.height);

           assert.equal(portrait.focus.x, cloned.focus.x);
           assert.equal(portrait.focus.y, cloned.focus.y);
       }) ;
    });

    describe('.resize', function(){
        it('should correctly resize', function(){

            var cloned = portrait.clone();
            cloned.resize(400, 700);

            assert.equal(400, cloned.width);
            assert.equal(700, cloned.height);

            assert.equal(cloned.focus.x, 200);
            assert.equal(cloned.focus.y, 350);
        });
    });

    describe('.fitsInto', function(){
        it('should check wether one bound is smaller than the other', function(){
            assert(!portrait.fitsInto(landscape));
            assert(!landscape.fitsInto(square));
            assert(square.fitsInto(landscape));
            assert(square.fitsInto(portrait));
        })
    });

    describe('.fit', function(){
        it('should scale smaller images proportionally up', function(){
            var   lClone = landscape.clone()
                , sClone = square.clone();

            sClone.fit(lClone);

            assert.equal(1080, sClone.width);
            assert.equal(1080, sClone.height);
            assert.equal(sClone.aspectRatio(), square.aspectRatio());
            assert(sClone.fitsInto(landscape));
        });

        it('should scale bigger images proportionally down', function(){
            var   lClone = landscape.clone()
                , sClone = square.clone();

            lClone.fit(sClone);

            assert.equal(400, lClone.width);
            assert.equal(225, lClone.height);
            assert.equal(lClone.aspectRatio(), landscape.aspectRatio());
            assert(lClone.fitsInto(square));
        });

        it('should should properly fit incompatible formats', function(){
            var   lClone = landscape.clone()
                , pClone = portrait.clone();

            lClone.fit(pClone);

            assert.equal(600, lClone.width);
            // this is rounded!
            assert.equal(337, lClone.height);
            // hence, the aspect ratio is not exactly the same anymore!!
            assert(lClone.isLandscape());
            assert(lClone.fitsInto(portrait));
        });
    });

    describe('.fill', function(){
        it('should scale smaller images proportionally up till they overlap', function(){

            var   lClone = landscape.clone()
                , sClone = square.clone();

            sClone.fill(lClone);

            assert.equal(1920, sClone.width);
            assert.equal(1920, sClone.height);

            assert.equal(sClone.aspectRatio(), square.aspectRatio());
            assert(landscape.fitsInto(sClone));
        });

        it('should scale bigger images proportionally down with overlap', function(){

            var   lClone = landscape.clone()
                , sClone = square.clone();

            lClone.fill(sClone);

            assert.equal(400, lClone.height);
            assert(700 < lClone.width);
            assert(lClone.isLandscape());
        });

        it('should should properly fill incompatible formats', function(){

            var   lClone = landscape.clone()
                , pClone = portrait.clone();

            lClone.fill(pClone);

            assert.equal(1200, lClone.height);
            // this is rounded
            assert.equal(lClone.width, 2133);
            assert(lClone.width > portrait.width);
        });
    });
});