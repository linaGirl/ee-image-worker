var   assert    = require('assert')

    , Color     = require('../lib/Color');

describe('Color', function(){
    describe('class', function(){
        it('should expose the byte lengths of the color models', function(){
            assert.equal(4, Color.models.rgba);
            assert.equal(3, Color.models.rgb);
            assert.equal(2, Color.models.greya);
            assert.equal(1, Color.models.grey);
        });
    });
});