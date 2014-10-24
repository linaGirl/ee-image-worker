"use strict";

var   Class     = require('ee-class')
    , types     = require('ee-types')
    , log       = require('ee-log')

    , Bounds    = require('../abstract/Bounds')
    , AbstractImage = require('../abstract/Image');

var PichaImage = module.exports = new Class({

      inherits: AbstractImage

    , init: function init(source, stats, engine){
        init.super.call(this, source, stats, new Bounds(source.width, source.height));
        this.engine = engine;
    }

    , getMimeType: function(){
        return this.getStats().mimetype;
    }

    , getColorModel: function(){
        return this.source.pixel;
    }
});