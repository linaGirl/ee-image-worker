"use strict";

var   Class     = require('ee-class')
    , types     = require('ee-types')
    , log       = require('ee-log');

var Image = module.exports = new Class({

      bounds: null
    , stats : null
    , source: null
    , engine: null

    , width: {get: function(){
        return this.source.width;
    }}

    , height: {get: function(){
        return this.source.height;
    }}

    , init  : function(source, stats, bounds, engine){
        this.source = source;
        this.stats  = stats;
        this.bounds = bounds;
        this.engine = engine;
    }

    , getType: function(){
        return this.getMimeType().split('/').pop().toLowerCase();
    }

    , getColorModel: function(){ throw new Error('Not yet implemented'); }
    , getColorBytesLength: function(){ throw new Error('Not yet implemented'); }

    , getStats: function(){
        return this.stats;
    }

    , getBounds: function(){
        return this.bounds;
    }

    , getFocus: function(){
        return this.focus;
    }

    , setFocus: function(focus){
        this.focus = focus;
        return this;
    }

    , resize: function(width, height, filter, callback){
        this.engine.resize(this, width, height, filter, callback);
    }

    , crop: function(width, height, offsets, callback){
        this.engine.crop(this, width, height, offsets, callback);
    }

    , pad: function(color, side, upper, callback){
        this.engine.pad(this, color, side, upper, callback);
    }

    , asTiff: function(opts, callback){
        this.engine.asTiff(this, opts, callback);
    }

    , asPng: function(opts, callback){
        this.engine.asPng(this, opts, callback);
    }

    , asJpg: function(opts, callback){
        this.engine.asJpg(this, opts, callback);
    }

    , asJpeg: function(opts, callback){
        return this.asJpg(opts, callback);
    }

    , asWebp: function(opts, callback){
        this.engine.asWebp(this, opts, callback);
    }

    , encode: function(format, options, callback) {
        this.engine.encode(format, options, callback);
    }

});