"use strict";

var   Class     = require('ee-class')
    , types     = require('ee-types')
    , log       = require('ee-log');

var Focus = module.exports = new Class({

      x : 0
    , y : 0

    , init : function init(x, y){
        this.x = x;
        this.y = y;
    }

    , maxX: function(){
        return this.x;
    }

    , adjust: function(ratioW, ratioH){
        this.x *= ratioW;
        this.y *= ratioH;
    }
});