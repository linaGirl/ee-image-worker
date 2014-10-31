"use strict";

var   Class             = require('ee-class')
    , types             = require('ee-types')
    , log               = require('ee-log')

    , errors            = require('./Error')
    , BaseTransformation    = require('./BaseTransformation');

/**
 * Represents an image, or better: a transformation bound to a buffer.
 *
 * @todo: create a utility function wich can be shared between the components for normalizing the parameters
 */

var Image = module.exports = new Class({

      buffer: null
    , inherits: BaseTransformation
    , bounds:null

    , width: {get: function(){
        return this.getStats().width;
    }}

    , height: {get: function(){
        return this.getStats().height;
    }}

    , mimetype: {get: function(){
        return this.getStats().mimetype;
    }}

    , colorModel: {get: function(){
        return this.getStats().colorModel;
    }}

    , init: function init(buffer, engine){
        init.super.call(this, engine);
        this._initializeState(buffer);
    }

    , _initializeState: function(buffer, bounds){
        this.buffer = buffer;
        this.stats  = this._stats(buffer);
        this.bounds = bounds || this.engine.getBounds(this.stats.width, this.stats.height);
        this.pipeline.clear();
        this._containsEncoding = false;
    }

    , getStats: function(){
        return this.stats;
    }

    , _setDimensions: function(width, height){
        this.getStats().width = width;
        this.getStats().height = height;
        this.bounds.resize(width, height);
    }

    , focusOn: function focusOn(focus){
        this.bounds.setFocus(focus);
        return focusOn.super.call(this, focus.clone());
    }

    /**
     * @todo: add a correct check for the dimensions (take offsets into account)
     */
    , crop: function crop(width, height, offset){
        if(width > this.width || height > this.height){
            throw new errors.DimensionError('Unable to crop an image area bigger than the image itself.')
        }

        this._setDimensions(width, height);

        return crop.super.call(this, width, height, offset);
    }
    /**
     * @todo: probably we should normalize the parameters inside the transformation instead the engine
     * @param color array
     * @param side can be an object containing {left, top, right, bottom} or a numeric value
     * @param upper if set, it will be used for the top and bottom padding
     */
    , pad: function pad(color, side, upper){
        if(!color.length) throw new errors.StateError('Invalid color value passed to pad.');

        var padding = this.engine._normalizePadding(side, upper);
        this._setDimensions(
            this.width + padding.left + padding.right,
            this.height + padding.top + padding.bottom);

        return pad.super.call(this, color, padding);
    }

    , resize: function resize(width, height, filter){

        this._setDimensions(width, height);

        return resize.super.call(this, width, height, filter);
    }

    , scale: function scale(dimensions, strategy){

            var   width         = dimensions.width
                , height        = dimensions.height
                , boundingBox   = this.engine.getBounds(width, height)
                , imageBox      = this.bounds.clone();

            if(!types.number(width) && !types.number(height)
                && ( strategy === 'fit' || strategy == 'crop')) {
                throw new errors.DimensionError('Provide valid height and width to crop the image');
            }

            switch(strategy){
                case 'crop':
                    imageBox.fill(boundingBox);
                    var pads = imageBox.adjustToFocusOf(boundingBox);
                    if(pads.left < 0 || pads.top < 0 || pads.bottom < 0 || pads.right < 0) {
                        this._setDimensions(width, height);
                        return scale.super.call(this, dimensions, strategy);
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
        this._setDimensions(imageBox.width, imageBox.height);
        return scale.super.call(this, dimensions, strategy);
    }

    , toBuffer: function(format, options, callback){
        if(types.function(options)){
            callback = options;
            options = {};
        }
        return this._applyTo(this.buffer, callback, format, options);
    }

    , _applyTo: function _applyTo(buffer, callback, autoEncode){
        return _applyTo.super.call(this, buffer, function(err, result){
            if(err) return callback(err);
            //log(result);
            this._initializeState(result, this.bounds);
            callback(null, result);
        }.bind(this), autoEncode);
    }

    , _encode: function _encode(format, options){
        if(!types.string(format)) return '';
        format = format.toLowerCase();
        format = (format.substr(0, 6) === 'image/') ? format : 'image/'+format;
        this.getStats().mimetype = format;
        return _encode.super.call(this, format, options);
    }

    , toPng: function toPng(opts, callback){
        return toPng.super.call(this, this.buffer, opts, callback, opts);
    }

    , toTiff: function toTiff(opts, callback) {
        return toTiff.super.call(this, this.buffer, opts, callback, opts);
    }

    , toJpg: function toJpg(opts, callback) {
        return toJpg.super.call(this, this.buffer, opts, callback, opts);
    }

    , toJpeg: function toJpeg(opts, callback) {
        return this.toJpg(opts, callback);
    }

    , toWebp: function toWebp(opts, callback) {
        return toWebp.super.call(this, this.buffer, callback, opts);
    }
});