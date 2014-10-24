"use strict";

var   Class     = require('ee-class')
    , types     = require('ee-types')
    , log       = require('ee-log')

    , picha     = require('picha')
    , AbstractEngine = require('../abstract/Engine')
    , Color     = require('../../Color')
    , PichaImage = require('./Image');

/**
 * Todo: transport the bounds from one image to another!
 */

var PichaEngine = module.exports = new Class({

      inherits: AbstractEngine

    , init: function init(){
        init.super.call(this);
        this.setFormatSupport(Object.keys(picha.catalog));
    }

    , stats: function(data){
        // normalize the stats!
        if(types.buffer(data)) return picha.stat(data);
        return data.stats;
    }

    , read: function(buffer, callback){
        picha.decode(buffer, function(err, img){
            if(err) return callback(err);
            callback(null, this.createImageFromSource(img, this.stats(buffer)));
        }.bind(this));
    }

    , resize: function(image, width, height, filter, callback){
        if(types.function(filter)) callback = filter;
        var resolved = this.resolveResizeFilter(filter);
        picha.resize(image.source, {
              filter: resolved
            , width: width
            , height: height
        }, function(err, img){
            // map error
            if(err) return log(err);
            callback(null, this.createImageFromSource(img, image.getMimeType()));
        }.bind(this));
    }

    , crop: function(image, width, height, offset, callback){
        if(types.function(offset)){
            callback = offset;
            offset = {};
        }
        // Todo: transform errors (possible error: 'invalid dimensions')
        var   normalized    = this._normalizeOffset(image.width, image.height, width, height, offset)
            , pichaImg;

        try {
            pichaImg = image.source.subView(normalized.left, normalized.top, width, height);
        } catch(e){
            return callback(e);
        }

        callback(null, this.createImageFromSource(pichaImg, image.getMimeType()));
    }

    , pad: function(image, color, side, upper, callback){
        if(types.function(upper)){
            callback = upper;
        }

        var   pad    = this._normalizePadding(side, upper)
            , height = image.height
            , buffers = this._computePaddingBuffers(image.width, height, image.getColorModel(), color, pad)
            , rows = [];

        for(var i=0; i < pad.top;i++) rows.push(buffers.line);
        // side padding
        for(var i=0; i<height; i++){
            rows.push(Buffer.concat([buffers.left, image.source.row(i), buffers.right]));
        }
        // lower padding
        for(var i = 0; i < pad.bottom;i++) rows.push(buffers.line);

        callback(null, this.createImageFromSource(
            new picha.Image({
                  width : image.width + pad.left + pad.right
                , height: height + pad.top + pad.bottom
                , data  : Buffer.concat(rows)
                , pixel : image.getColorModel()
            })
            , image.getMimeType()
        ));
    }

    , _computePaddingBuffers: function(imgW, imgH, imgColor, color, padding){

        var   fullwidth = imgW + padding.left + padding.right
            , byteLen   = Color.resolveByteLength(imgColor)
        // rounded to the next multiple of 4
            , stride    = ((fullwidth * byteLen + 3) & ~3);

        var buffers   = {
            line  : new Buffer(stride)
            , left  : new Buffer(padding.left * byteLen)
            , right : new Buffer(stride - imgW * byteLen - padding.left * byteLen)
        };

        var col = this.convertPixelColor(color, imgColor);

        Object.keys(buffers).forEach(function(key){

            var   buffer    = buffers[key];

            for(var i=0; i<buffer.length; i++){
                buffer.writeUInt8(col[i%byteLen], i);
            }
        }, this);

        return buffers;
    }

    , _option: function(name, target, source, alias){
        if(!source) return target;

        alias = alias || name;
        if(!types.undefined(source[name])){
            target[alias] = source[name];
        }

        return target;
    }

    , encode: function(img, type, options, next){
        if(!type) type = img.getType();

        options = options || {};

        // Todo: add a check which ensures the support for the codec
        // Todo: map the errors
        switch(type){
            case 'png':
            case 'image/png':
                // no options
                picha.encodePng(img.source, options, next);
                break;
            case 'tiff':
            case 'image/tiff':
                picha.encodeTiff(img.source, options, next);
                break;
            case 'webp':
            case 'image/webp':
                picha.encodeWebP(img.source, options, next);
                break;
            default:
                picha.encodeJpeg(img.source, options, next);
                break;
        }
    }

    , asTiff: function(img, opts, callback){
        if(types.function(opts)){
            callback = opts;
            opts = {};
        }
        var options = this._option('compression', {}, opts);
        return this.encode(img, 'tiff', options, callback);
    }

    , asPng: function(img, opts, callback){
        if(types.function(opts)){
            callback = opts;
            opts = {};
        }
        return this.encode(img, 'png', opts, callback);
    }

    , asJpg: function(img, opts, callback){
        if(types.function(opts)){
            callback = opts;
            opts = {};
        }
        var options = this._option('quality', {}, opts);
        return this.encode(img, 'jpeg', options, callback);
    }

    , asJpeg: function(img, opts, callback){
        return this.asJpg(img, opts, callback);
    }

    , asWebp: function(img, opts, callback){
        if(types.function(opts)){
            callback = opts;
            opts = {};
        }

        var options = this._option('quality', {}, opts);
        this._option('alphaQuality', options, opts);
        this._option('compression', options, opts, 'preset');
        return this.encode(img, 'webp', opts, callback);
    }

    , createImageFromSource: function(img, stats){
        var stat = stats;
        if(types.string(stats)){
            stat = {
                  width    : img.width
                , height   : img.height
                , pixel    : img.pixel
                , mimetype : stats
            };
        }
        return new PichaEngine.Image(img, stat, this);
    }

    , resolveResizeFilter: function(filter){
        if(types.string(filter) && PichaEngine.resizeFilters[filter.toUpperCase()]){
            return filter.toLowerCase();
        }
        return PichaEngine.resizeFilters.LANCZOS;
    }

    , convertPixelColor: function(bytes, target){
        var   by        = bytes.slice(0,4)
            , model     = Color.resolveModel(by)
            , targetLen = Color.resolveByteLength(target)
            , converted = picha.colorConvertSync(new picha.Image({
                width : 1
                , height: 1
                , pixel : model
                , data  : new Buffer(by)
            }), { pixel: target });

        return converted.data.slice(0, targetLen);
    }

});

PichaEngine.resizeFilters = {
    LANCZOS   : 'lanczos'
    , BICUBIC   : 'cubic'
    , CATMULROM : 'catmulrom'
    , MITCHEL   : 'mitchel'
    , BOX       : 'box'
    , TRIANGLE  : 'triangle'
};

PichaEngine.Image = PichaImage;