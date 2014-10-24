"use strict";

var   Class     = require('ee-class')
    , types     = require('ee-types')
    , log       = require('ee-log');

/**
 * Todo: create a compound focus
 */
var Focus = module.exports = new Class({

      x : 0
    , y : 0

    , init : function init(x, y){
        this.x = x;
        this.y = y;
    }

    , adjust: function(ratioW, ratioH){
        this.x *= ratioW;
        this.y *= ratioH;
    }
});