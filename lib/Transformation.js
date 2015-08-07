"use strict";

var   Class     = require('ee-class')
    , types     = require('ee-types')
    , log       = require('ee-log')

    , BaseTransformation = require('./BaseTransformation');

var Transformation = module.exports = new Class({

      inherits: BaseTransformation

    , encode: function(format, options) {
        return this._encode(format, options);
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
    , applyTo: function(buffer, callback){
        return this._applyTo(buffer, callback);
    }
});
