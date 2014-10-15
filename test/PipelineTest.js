var   assert    = require('assert')
    , Pipeline  = require('../lib/Pipeline');

describe('The Pipeline', function(){

    var   pipeline  = new Pipeline();

    describe('constructor', function(){
        it('should be empty', function(){
            assert.equal(0, pipeline.length);
        });
    });

    describe('append', function(){
       it('should allow appending functions', function(){
           pipeline.append(function(data, next){
               data.push('1');
               next(null, data);
           });
           pipeline.append(function(data, next){
               data.push('2');
               next(null, data);
           });
           assert.equal(2, pipeline.length);
       });
    });

    describe('prepend', function(){
        it('should allow prepending function', function(){
            pipeline.prepend(function(data, next){
                data.push('0');
                setTimeout(function(){
                    next(null, data);
                }, 50);
            });
            assert.equal(3, pipeline.length);
        });
    });

    describe('invoke', function(){
        it('should invoke all the functions in the corresponding order', function(done){
            pipeline.invoke([], function(err, result){
                assert.deepEqual(['0', '1', '2'], result);
                done(err);
            });
        });
        it('should not do anything if not rewinded properly', function(done){
            pipeline.invoke([], function(err, result){
                assert.equal(0, result.length);
                done();
            });
        });
        it('should be reusable if rewinded', function(done){
            pipeline.rewind().invoke(['3'], function(err, result){
                assert.deepEqual(['3', '0', '1', '2'], result);
                done(err);
            });
        });
    });
});