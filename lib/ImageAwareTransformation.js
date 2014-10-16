"use strict";

var   Class     = require('ee-class')
    , types     = require('ee-types')
    , log       = require('ee-log')

    , picha     = require('picha')

    , resizing  = require('./resizing')

    , Transformation = require('./Transformation')
    , Color     = require('./Color')
    , Pipeline  = require('./Pipeline');

var ImageAwareTransformation = module.exports = new Class({

      inherits  : Transformation
    , image     : null

    , init: function init(image){
        init.super.call(this);
        this.image = image;
    }

    , resize: function resize(width, height, filter){
        this.image.width    = width;
        this.image.height   = height;
        return resize.super.call(this, width, height, filter);
    }

    , pad: function pad(color, left, top, right, bottom){
        if(!color.length) throw new Error('No valid color provided');

        var pad = this._normalizePadding(this.image, false, left, top, right, bottom);
        this.image.height   = pad.height;
        this.image.width    = pad.width;
        return pad.super.call(this, color, pad.left, pad.top, pad.right, pad.bottom);
    }

    , crop: function crop(left, top, right, bottom){
        var   pad  = this._normalizePadding(this.image, true, left, top, right, bottom);
        this.image.height   = pad.height;
        this.image.width    = pad.width;
        return crop.super.call(this, color, pad.left, pad.top, pad.right, pad.bottom);
    }
});