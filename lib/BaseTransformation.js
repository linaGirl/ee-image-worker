"use strict";

var   Class     = require('ee-class')
    , types     = require('ee-types')
    , log       = require('ee-log')

    , errors    = require('./Error')
    , Color     = require('./Color')
    , Pipeline  = require('./Pipeline')
    , engines   = require('./engine');

/**
 * @todo: make the scaling strategy pluggable (for further extensions)
 */

var BaseTransformation = module.exports = new Class({

      pipeline          : null
    , _containsEncoding : false
    , engine            : null

    , init: function init(engine){
        this.pipeline           = new Pipeline();
        this._containsEncoding  = false;
        this.engine             = engine || engines.DefaultEngine;
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

    , pad: function(color, side, upper){
        if(!color.length) throw new errors.StateError('Invalid color value passed to pad.');

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

    , focusOn: function(focus){
        this.pipeline.append(function(image, next){
            next(null, image.setFocus(focus));
        });
        return this;
    }

    , scale: function(dimensions, strategy){
        this.pipeline.append(function(image, next){

            var   width         = parseInt(dimensions.width, 10)
                , height        = parseInt(dimensions.height, 10)
                , boundingBox   = this.engine.getBounds(width, height)
                , imageBox      = image.getBounds().clone();

            // zero is also not a valid dimension
            if(!width && !height && ( strategy === 'fit' || strategy == 'crop')) {
                return next(new errors.DimensionError('Provide valid height and width to crop the image'));
            }

            switch(strategy){
                case 'crop':
                    imageBox.fill(boundingBox);
                    // compute the padding, negative means we need to crop
                    var pads = imageBox.adjustToFocusOf(boundingBox);
                    if(pads.left < 0 || pads.top < 0 || pads.bottom < 0 || pads.right < 0) {
                        // bypass the control flow of the pipeline by manipulating the callback
                        var oldCallback = next;
                        next = function(err, img) {
                            if(err) return oldCallback(err);
                            imageBox.resize(width, height);
                            this.engine.crop(img, width, height, pads, oldCallback);
                        }.bind(this);
                    }
                    break;
                case 'fit':
                    imageBox.fit(boundingBox);
                    break;
                case 'resize':
                default:
                    if(!width) {
                        imageBox.scaleToHeight(height);
                    } else if(!height) {
                        imageBox.scaleToWidth(width);
                    } else {
                        imageBox.resize(width, height);
                    }
            }
            this.engine.resize(image, imageBox.width, imageBox.height, next);
        }.bind(this));
        return this;
    }

    /**
     * Adds an encoding step to the pipeline if there is no callback passed.
     * @param format
     * @param options
     * @private
     */
    , _encode: function(format, options) {

        if(this._containsEncoding) {
            throw new errors.StateError('Applied more than one encoding step.');
        }

        this._containsEncoding = true;
        this.pipeline.append(function(img, next){
            this.engine.encode(img, format, options, next);
        }.bind(this));
        return this;
    }

    , toTiff: function(buffer, opts, callback){
        if(types.function(opts)){
            callback = opts;
            opts = {};
        }
        return this._applyTo(buffer, callback, 'tiff', opts);
    }

    , toPng: function(buffer, opts, callback){
        if(types.function(opts)){
            callback = opts;
            opts = {};
        }
        return this._applyTo(buffer, callback, 'png', opts);
    }

    , toJpg: function(buffer, opts, callback){
        if(types.function(opts)){
            callback = opts;
            opts = {};
        }
        return this._applyTo(buffer, callback, 'jpg', opts);
    }

    , toJpeg: function(buffer, opts, callback){
        return this.toJpg(buffer, opts, callback);
    }

    , toWebp: function(buffer, opts, callback){
        if(types.function(opts)){
            callback = opts;
            opts = {};
        }
        return this._applyTo(buffer, callback, 'webp', opts);
    }

    , _stats: function(buffer){
        return this.engine.stats(buffer);
    }

    /**
     * Adds an encoding step to the pipeline to ensure there
     * is a conversion to a buffer.
     *
     * This now is a non persistent change and is applied every time as long
     * as there is no explicit encoding passed, or appended to the pipeline.
     *
     * @param buffer the original image buffer
     * @private
     */
    , _ensureEncoding: function(buffer, finalCallback, encoding, opts){
        if(!this._containsEncoding){
            return function(err, img){

                if(err) return finalCallback(err);
                var type    = types.string(encoding) ? encoding : img.getMimeType();
                opts        = opts || {quality: 85};
                this.engine.encode(img, type, finalCallback);

            }.bind(this);
        }
        return finalCallback;
    }

    /**
     * Applies the current transformations to a buffer by
     * creating an engine specific image and passing it through
     * the pipeline.
     *
     * If there are no actions in the pipeline, we omit the decoding
     * and directly pass the buffer to the callback.
     *
     * @param buffer the image buffer
     * @param callback the callback receiving error and the resulting buffer
     */
    , _applyTo: function(buffer, callback, encoding, opts){
        if(!this.pipeline.length && !encoding) return callback(null, buffer);

        var cb = this._ensureEncoding(buffer, callback, encoding, opts);

        this.engine.read(buffer, function(err, img) {
            if(err) return cb(err);
            this.runPipeline(img, cb);
        }.bind(this));
        return this;
    }

    /**
     * Rewinds and invokes the pipeline with the given image.
     *
     * @param img an engine specific image
     * @param callback
     */
    , runPipeline: function(img, callback){
        this.pipeline.rewind().invoke(img, callback);
    }
});

BaseTransformation.filter = {
      LANCZOS   : 'lanczos'
    , BICUBIC   : 'cubic'
    , CATMULROM : 'catmulrom'
    , MITCHEL   : 'mitchel'
    , BOX       : 'box'
    , TRIANGLE  : 'triangle'
};