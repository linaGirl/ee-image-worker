"use strict";

var   Class     = require('ee-class')
    , types     = require('ee-types')
    , log       = require('ee-log')
    , State     = require('./State');

var Img = module.exports = new Class({
      state : null
    , width : {get: function(){
        return this.state.getWith();
    }}
    , height : {get: function(){
        return this.state.getHeight();
    }}
    , stats : {get: function(){
        return this.state.getStats();
    }}

    , init: function init(buffer) {
        // the idea is to wrap all the applied transformations into a state
        this.state = new State(buffer);

    }

    , resize: function(width, height, filter){

    }

    , cut: function(left, top, right, bottom){

        left    = Math.abs(left);
        top     = Math.abs(top);
        right   = types.number(right) ? Math.abs(right) : left;
        bottom  = types.number(bottom) ? Math.abs(bottom) : top;

        this.state.cut(left, top, right, bottom);
        return this;
    }

    , toBuffer: function(callback){
        this.state.toJpeg().toBuffer(callback);
    }
});