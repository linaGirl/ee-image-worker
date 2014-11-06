"use strict";

var   Class     = require('ee-class')
    , types     = require('ee-types')
    , log       = require('ee-log');

/**
 * Focal Point representation.
 *
 * Currently the correctness of the focus coordinates is not too important.
 * Therefore the rounding of the values is quite random ;)
 *
 * @todo: create Focus Areas and more sophisticated variants of focuses.
 */
var Focus = module.exports = new Class({

      x : 0
    , y : 0

    , init : function init(x, y){
        this.x = parseInt(x, 10);
        this.y = parseInt(y, 10);
    }

    , adjust: function(ratioW, ratioH){
        this.x = Math.round(this.x * ratioW);
        this.y = Math.round(this.y * ratioH);
    }

    , clone: function(){
        return new Focus(this.x, this.y);
    }
});