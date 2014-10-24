"use strict";

var   Class     = require('ee-class')
    , types     = require('ee-types')
    , log       = require('ee-log')

    , picha     = require('picha')

    , Bounds    = require('./engine/abstract/Bounds')
    , Color     = require('./Color')
    , Pipeline  = require('./Pipeline');

var Transformation = module.exports = new Class({

      pipeline          : null
    , _containsEncoding : false
    , engine            : null

    , init: function init(engine){
        this.pipeline           = new Pipeline();
        this._containsEncoding  = false;
        this.engine             = engine;
    }

    , resize: function(width, height, filter){
        this.pipeline.append(function(image, next){
            this.engine.resize(image, width, height, filter, next);
        }.bind(this));
        return this;
    }

    , plug: function(callback) {
        this.pipeline.append(callback);
        return this;
    }

    // Todo: add a dedicated error class
    , pad: function(color, side, upper){
        if(!color.length) throw new Error('No valid color provided');

        this.pipeline.append(function(image, next){
            this.engine.pad(image, color, side, upper, next);
        }.bind(this));
        return this;
    }

    , crop: function(width, height, offset) {
        this.pipeline.append(function (image, next) {
            this.engine.crop(image, width, height, offset, next);
        }.bind(this));
        return this;
    }

    , scale: function(bounds, strategy){
        this.pipeline.append(function(image, next){
            var   width  = bounds.width
                , height = bounds.height;

            var boundingBox = new Bounds(width, height);
        });
    }

    , encode: function(format, options){
        // todo: transform the error to an internal format
        if(this._containsEncoding) throw new Error('Applied more than one encoding step.');
        this._containsEncoding = true;

        // after the encoding we are not allowed to push other actions ...
        this.pipeline.append(function(img, next){
            this.engine.encode(img, format, options, next);
        }.bind(this));
        return this;
    }

    , tiff: function(img, opts, callback){
        return this.encode('tiff', opts).applyTo(img, callback);
    }

    , png: function(img, opts, callback){
        return this.encode('png', opts).applyTo(img, callback);
    }

    , jpg: function(img, opts, callback){
        return this.encode('jpeg', opts).applyTo(img, callback);
    }

    , jpeg: function(img, opts, callback){
        return this.jpg(img, opts, callback);
    }

    , webp: function(img, opts, callback){
        return this.encode('webp', opts).applyTo(img, callback);
    }

    , _stats: function(buffer){
        return this.engine.stats(buffer);
    }

    , _autoEncode: function(buffer){
        this.encode(this._stats(buffer).mimetype);
    }

    , applyTo: function(buffer, callback){
        // omit en/decoding if no transformations are specified
        if(this.pipeline.length == 0) return callback(buffer);
        // make sure the final result is an encoded buffer!
        if(!this._containsEncoding) this._autoEncode(buffer);
        // decode the buffer into an image
        this.engine.read(buffer, function(err, img) {
            // todo: transform the error to an internal format
            if(err) return callback(err);
            // rewind the pipeline and invoke it on the image
            this.runPipeline(img, callback);
        }.bind(this));
    }

    , runPipeline: function(img, callback){
        this.pipeline.rewind().invoke(img, callback);
    }
});

Transformation.filter = {
      LANCZOS   : 'lanczos'
    , BICUBIC   : 'cubic'
    , CATMULROM : 'catmulrom'
    , MITCHEL   : 'mitchel'
    , BOX       : 'box'
    , TRIANGLE  : 'triangle'
};