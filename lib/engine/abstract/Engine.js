"use strict";

var   Class     = require('ee-class')
    , types     = require('ee-types')
    , log       = require('ee-log');

var Engine = module.exports = new Class({
    supportedFormats: null
    , init: function init(){
        this.supportedFormats = [];
    }
    /**
     * Read in an image and return an internal image representation
     *
     * @param buffer
     * @param callback
     */
    , read    : function(buffer, callback){ throw new Error('Not yet implemented.'); }
    , stats   : function(buffer){ throw new Error('Not yet implemented.'); }

    , supports: function(format){
        var formatMime = this.formatToMime(format);
        return     this.supportedFormats.indexOf(format)!==-1
                || this.supportedFormats.indexOf(formatMime) !== -1;
    }

    , formatToMime: function(format){
        if(!types.string(format)) return '';
        format = format.toLocaleLowerCase();
        return (format.substr(0, 6) === 'image/') ? format : 'image/'+format;
    }

    , setFormatSupport: function(formats){
        this.supportedFormats = formats;
    }

    , _normalizeOffset: function(width, height, targetW, targetH, offset){

        offset = offset || {};

        var normalized = {
            left  : 0
            , right : 0
            , top   : 0
            , bottom: 0
        };

        if(types.number(offset.right)){
            normalized.left  = width - Math.abs(offset.right) - targetW;
        }

        if(types.number(offset.left)){
            normalized.left  = Math.abs(offset.left);
        }

        if(types.number(offset.bottom)){
            normalized.top = height - Math.abs(offset.bottom) - targetH;
        }

        if(types.number(offset.top)){
            normalized.top = Math.abs(offset.top);
        }

        normalized.bottom = height - targetH - normalized.top;
        normalized.right  = width - targetW - normalized.left;

        return normalized;
    }

    , _normalizePadding: function(side, upper){
        if(types.number(side) && types.number(upper)){
            return this._normedPad(side, upper, side, upper);
        }
        if(types.number(side)){
            return this._normedPad(side, side, side, side);
        }
        // object
        return this._normedPad(side.left, side.top, side.right, side.bottom);
    }

    , _normedPad: function(left, top, right, bottom){
        return {
            left  : Math.abs(parseInt(left || 0 , 10))
            , top   : Math.abs(parseInt(top || 0 , 10))
            , right : Math.abs(parseInt(right || 0 , 10))
            , bottom: Math.abs(parseInt(bottom || 0 , 10))
        }
    }
});

Engine.setImageClass = function(imgClass){
    this.Image = imgClass;
};