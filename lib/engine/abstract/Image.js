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

    , getColorModel: function(){ throw new errors.NotSupportedError('GetColorModel not yet implemented'); }
    , getColorBytesLength: function(){ throw new errors.NotSupportedError('GetColorBytesLength not yet implemented'); }

    , getStats: function(){
        return this.stats;
    }

    , getBounds: function(){
        return this.bounds;
    }

    , getFocus: function(){
        return this.bounds.getFocus();
    }

    , setFocus: function(focus){
        this.bounds.setFocus(focus);
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

    , toTiff: function(opts, callback){
        this.engine.toTiff(this, opts, callback);
    }

    , toPng: function(opts, callback){
        this.engine.toPng(this, opts, callback);
    }

    , toJpg: function(opts, callback){
        this.engine.toJpg(this, opts, callback);
    }

    , toJpeg: function(opts, callback){
        return this.toJpg(opts, callback);
    }

    , toWebp: function(opts, callback){
        this.engine.asWebp(this, opts, callback);
    }

    , encode: function(format, options, callback) {
        this.engine.encode(format, options, callback);
    }

});