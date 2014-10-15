"use strict";

var   Class     = require('ee-class')
    , types     = require('ee-types')
    , log       = require('ee-log')
    , picha     = require('picha')
    , Pipeline  = require('./fluent/CallStack');

var State = module.exports = new Class({

      buffer : null
    , pipeline : null

    , init : function init(buffer){
        this.buffer     = buffer;
        this.pipeline   = new Pipeline();
    }

    , getHeight: function(){

    }

    , getWidth: function(){

    }

    , getStats: function(){
        if(!this.stats) this.stats = picha.stat(this.buffer);
        return this.stats;
    }

    , cut: function(left, top, right, bottom){
        var   stats     = this.getStats()
            , newWidth  = stats.width - left - right
            , newHeight = stats.height - top - bottom;

        stats.width -= left + right;
        stats.height -= top + bottom;

        this.pipeline.append(function(image, next){
            log(image.subView(left, top, newWidth, newHeight));
            next(null, image.subView(left, top, newWidth, newHeight));
        });
    }

    , toJpeg: function(){
        this.pipeline.append(function(image, next){
            log.debug('toJpeg');
            picha.encodeJpeg(image, next);
        });
        return this;
    }

    , toBuffer: function(callback){
        picha.decode(this.buffer, function(err, img){
            if(err) return callback(err);
            this.pipeline.execute(img, callback);
        }.bind(this));
    }
});