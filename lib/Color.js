"use strict";

var   Class     = require('ee-class')
    , types     = require('ee-types')
    , log       = require('ee-log');

var Color = module.exports = new Class({
      bytes: null
    , length: { get: function(){
        return this.bytes.length;
    }}

    , init: function init(bytes){
        this.bytes = bytes;
    }

    , hasAlpha: function(){
        return this.bytes.length % 2 === 0;
    }

    , getAlpha: function(){
        return this.hasAlpha() ? this.getBytes()[this.length-1] : 0xFF;
    }

    , getBytesWithoutAlpha: function(){
        if(!this.hasAlpha()) return this.getBytes();
        return this.getBytes().slice(0, this.length-1);
    }

    , getBytesWithAlpha: function(alpha){
        if(this.hasAlpha()) return this.getBytes();
        return this.getBytes().concat([alpha || this.getAlpha()]);
    }

    , getBytes: function(){
        return this.bytes;
    }

    , to: function(model){
        switch(model){
            case 'rgba' :   return this.toRgba();
            case 'rgb'  :   return this.toRgb();
            case 'grey' :   return this.toGrey();
            case 'greya':   return this.toGreya();
        }
        return null;
    }

});

var Grey = Color.Grey = new Class({
      inherits: Color
    , toRgba: function(algo, options){
        return Color.GreyToRgba(this, algo, options);
    }

    , toRgb: function(algo, options){
        // to
        return this.toRgba(algo, options).toRgb();
    }

    , toGrey: function(){
        return this;
    }

    , toGreya: function(){
        return new Color.Greya(this.getBytesWithAlpha());
    }

});

var Greya = Color.Greya = new Class({
      inherits: Grey
    , toGrey: function(){
        return new Color.Grey(this.getBytesWithoutAlpha());
    }
    , toGreya: function(){
        return this;
    }
});

var Rgb = Color.Rgb = new Class({

      inherits: Color

    , toRgba: function(){
        return new Color.Rgba(this.getBytesWithAlpha());
    }

    , toRgb: function(){
        return this;
    }

    , toGrey: function(algo, options){
        return this.toGreya(this, algo, options);
    }

    , toGreya: function(algo, options){
        return Color.rgbToGreya(this, algo, options);
    }
});

var Rgba = Color.Rgba = new Class({
      inherits: Rgb
    , toRgba: function(){
        return this;
    }

    , toRgb: function(){
        return new Color.Rgb(this.getBytesWithoutAlpha());
    }
});

Color.Greyscale = {
      LIGHTNESS     : 'lightness'
    , LUMINOSITY    : 'luminosity'
    , AVERAGE       : 'average'
};

Color.models = {
      rgba    : 4
    , rgb     : 3
    , greya   : 2
    , grey    : 1
};

Color.GreyToRgba = function(color, algo, options){
    var weights = options || {};

    var   bytes             = color.getBytes()
        , rgba              = []
        , Grey;


    rgba.push(bytes[0]);
    rgba.push(bytes[0]);
    rgba.push(bytes[0]);

    rgba.push(bytes[1] || 0xFF);

    return new Color.Rgba(rgba);
};

Color.luminosityDefaults = {
      r : 0.21
    , g : 0.72
    , b : 0.07
};

Color.rgbToGreya = function(color, algo, options){
    var weights = options || {};

    var   bytes             = color.getBytes()
        , grey;

    switch(algo){
        case Color.Greyscale.AVERAGE:
            grey = (bytes[0] + bytes[1] + bytes[2]) / 3;
            break;
        case Color.Greyscale.LIGHTNESS:
            var rgb = bytes.slice(0, 2);
            grey =  (Math.max.apply(Math, rgb) + Math.min.apply(Math, rgb)) / 2;
            break;
        default: // luminosity
            var channelWeights    = {
                  r : weights.r || Color.luminosityDefaults.r
                , g : weights.g || Color.luminosityDefaults.g
                , b : weights.b || Color.luminosityDefaults.b
            };

            grey =    channelWeights.r * bytes[0]
                    + channelWeights.g * bytes[1]
                    + channelWeights.b * bytes[2];
    }

    var greyValue = [ Math.round(grey) ];
    greyValue.push(bytes[4] || 0xFF);
    return new Color.Greya(greyValue);
};

Color.fromArray = function(array){
    switch(array.length){
        case 1: return new Color.Grey(array);
        case 2: return new Color.Greya(array);
        case 3: return new Color.Rgb(array);
        default:
            return new Color.Rgba(array.slice(0,4));
    }
};