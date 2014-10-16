"use strict";

var   Class     = require('ee-class')
    , types     = require('ee-types')
    , log       = require('ee-log')

    , picha     = require('picha')

    , resizing  = require('./resizing')

    , Color     = require('./Color')
    , Pipeline  = require('./Pipeline');

var Transformation = module.exports = new Class({

      pipeline : null
    , _containsEncoding : false

    , init: function init(){
        this.pipeline           = new Pipeline();
        this._containsEncoding  = false;
    }

    , resize: function(width, height, filter){
        this.pipeline.append(function(image, next){

            var f = (types.string(Transformation.filter[filter]))
                        ? filter
                        : Transformation.filter.LANCZOS;

            picha.resize(image, {
                  filter    : f
                , width     : width
                , height    : height
            }, next);
        });
        return this;
    }

    , with: function(transformation){
        this.plug(function(img, next){
            transformation.runPipeline(img, next);
        });
        return this;
    }

    , plug: function(callback) {
        this.pipeline.append(callback);
        return this;
    }

    /**
     * Computes and normalizes values passed to cropping and padding.
     * If it is a crop action, the width and height gets computed accordingly.
     */
    , _normalizePadding: function(img, crop, left, top, right, bottom){

        left    = Math.abs(parseInt(left || 0, 10));
        top     = Math.abs(parseInt(top || left, 10));

        right   = Math.abs(types.number(right)   ? right : left);
        bottom  = Math.abs(types.number(bottom)  ? bottom : top);

        return {
              left      : left
            , top       : top
            , right     : right
            , bottom    : bottom
            , width     : (crop) ? img.width - left - right : img.width + left + right
            , height    : (crop) ? img.height - top - bottom : img.height + top + bottom
        };
    }

    , pad: function(color, left, top, right, bottom){
        if(!color.length) throw new Error('No valid color provided');
        this.pipeline.append(function(image, next){

            var   pad   = this._normalizePadding(image, false, left, top, right, bottom)
                , buffers = this.computePadding(image, color, pad)
                , rows  = []
                , height = image.height;

            for(var i=0; i<pad.top;i++) rows.push(buffers.line);

            for(var i=0; i<height; i++){
                rows.push(Buffer.concat([buffers.left, image.row(i), buffers.right]));
            }

            for(var i=0; i<pad.bottom;i++) rows.push(buffers.line);

            next(null, new picha.Image({
                  width : pad.width
                , height: pad.height
                , data  : Buffer.concat(rows)
                , pixel : image.pixel
            }));
        }.bind(this));
        return this;
    }

    , computePadding: function(img, color, padding){

        var   height    = img.height
            , width     = img.width
            , fullwidth = padding.width
            , byteLen   = Color.models[img.pixel]
            // rounded to the next multiple of 4
            , stride    = ((fullwidth * byteLen + 3) & ~3);

        var buffers   = {
                  line  : new Buffer(stride)
                , left  : new Buffer(padding.left * byteLen)
                , right : new Buffer(stride - width * byteLen - padding.left * byteLen)
        };

        var col = this._convertColor(color, img.pixel);
        log(col);
        Object.keys(buffers).forEach(function(key){

            var   buffer    = buffers[key];

            for(var i=0; i<buffer.length; i++){
                buffer.writeUInt8(col[i%byteLen], i);
            }
        }, this);

        return buffers;
    }

    /**
     * Probably we have to change this to keep the interface consistent?
     */
    , crop: function(left, top, right, bottom){
        this.pipeline.append(function(image, next){
            var   pad  = this._normalizePadding(image, true, left, top, right, bottom);
            next(null, image.subView(pad.left, pad.top, pad.width, pad.height));
        }.bind(this));
        return this;
    }

    , _option: function(name, target, source, alias){
        if(!source) return target;

        alias = alias || name;
        if(!types.undefined(source[name])){
            target[alias] = source[name];
        }

        return target;
    }

    , encode: function(format, options){
        // todo: transform the error to an internal format
        if(this._containsEncoding) throw new Error('Applied more than one encoding step.');
        this._containsEncoding = true;

        // after the encoding we are not allowed to push other actions ...
        this.pipeline.append(function(img, next){
            // we cannot access the initial mimetype anymore!!
            if(!format) format = 'jpg';
            format = format.split('/').pop().toLowerCase();

            options = options || {};

            switch(format){
                case 'png':
                    // no options
                    picha.encodePng(img, next);
                    break;
                case 'tiff':
                    picha.encodeTiff(img, options, next);
                    break;
                case 'webp':
                    picha.encodeWebP(img, options, next);
                    break;
                default:
                    picha.encodeJpeg(img, options, next);
                    break;
            }
        }.bind(this));
        return this;
    }

    , tiff: function(img, opts, callback){
        var options = this._option('compression', {}, opts);
        return this.encode('tiff', options).applyTo(img, callback);
    }

    , png: function(img, opts, callback){
        return this.encode('png', opts).applyTo(img, callback);
    }

    , jpg: function(img, opts, callback){
        var options = this._option('quality', {}, opts);
        return this.encode('jpeg', options).applyTo(img, callback);
    }

    , jpeg: function(img, opts, callback){
        return this.jpg(img, opts, callback);
    }

    , webp: function(img, opts, callback){
        var options = this._option('quality', {}, opts);
        this._option('alphaQuality', options, opts);
        this._option('compression', options, opts, 'preset');
        return this.encode('webp', opts).applyTo(img, callback);
    }

    , _stats: function(buffer){
        return picha.stat(buffer);
    }

    , _convertColor: function(bytes, target){
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

    , _autoEncode: function(buffer){
        this.encode(this._stats(buffer).mimetype);
    }

    , applyTo: function(buffer, callback){
        // omit en/decoding!
        if(this.pipeline.length == 0) return callback(buffer);
        // make sure the final result is an encoded buffer!
        if(!this._containsEncoding) this._autoEncode(buffer);
        // decode the buffer into an image
        picha.decode(buffer, function(err, img){
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