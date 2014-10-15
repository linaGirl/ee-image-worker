var Class   = require('ee-class'),
    log     = require('ee-log'),
    picha   = require('picha'),
    arg     = require('ee-arguments'),

    fluent  = require('./fluent'),
    resizing = require('./resizing');
/**
 * @type {WorkerImage}
 *
 */
var Image = module.exports = new Class({

      inherits: fluent.FluentStack

    , FILTER_LANCZOS:   'lanczos'
    , FILTER_BICUBIC:   'cubic'
    , FILTER_CATMULROM: 'catmulrom'
    , FILTER_MITCHEL:   'mitchel'
    , FILTER_BOX:       'box'
    , FILTER_TRIANGLE:  'triangle'

    , top: 0
    , left: 0

    , originalWidth: null
    , originalHeight: null

    , width: 0
    , height: 0

    , stats: null
    , wrapped: null

    , focalArea: null

    , init: function initialize(buffer, options, focalArea){
        this.buffer = (buffer) ? buffer: new Buffer(0);
        this.options = options;
    }

    , setWrapped: function(wrapped){
        this.wrapped = wrapped,
        this.height = this.originalHeight = wrapped.height,
        this.width = this.originalWidth = wrapped.width;
    }

    , _getWrapped : function(){
        return this.wrapped;
    }

    , getHeight: function(){
        return (this.height) ? this.height : this.stat().height;
    }

    , getWidth: function(){
        return (this.width) ? this.width : this.stat().width;
    }

    /**
     * the crop() method returns the reference to the image instance( support for method chaining )
     * the crop method does not execute immediately, the command gets executed when the «toBuffer»
     * is called
     *
     * @param <Number> top, optional, defaults to 0
     * @param <Number> left, optional, defaults to 0
     * @param <Number> height, optional, defaults to image.height
     * @param <Number> width, optional, defaults to image.width
     */
    , crop : function(options){
        var top     = options.top || 0,
            left    = options.left || 0;

        var height  = options.height || (this.getHeight() - top),
            width   = options.width || (this.getWidth() - left);

            this.top += top;
            this.left += left;
            this.height = height;
            this.width = width;

            this.push(function(err, data, options){
                if(err){
                    this.callFinal(err);
                } else {
                    try {
                        var sub = data.subView(left, top, width, height);
                        this.setWrapped(sub);
                        this.callNext(null, sub, options);
                    } catch (error){
                        this.callFinal(error);
                    }
                }
            });
        return this;
    }

    /**
     * the resize() method returns the reference to the image instance( support for method chaining )
     * the resize method does not execute immediately, the command gets executed when the «toBuffer»
     * is called
     *
     * @param <Number> height, optional, defaults to image.height
     * @param <Number> width, optional, defaults to image.width
     * @param <String> mode, optional, defaults to face if facedata was passed to the «loadImage»
     *                 or crop when there is no face data.
     *                 fit:     the image is fitted inside a frame, so that there will be transparent
     *                          pixels on top & the bottom or on both sides
     *                 crop:    pixels are removed either on top & the bottom or on both sides of
     *                          the image
     *                 distort: the image is disorted into the box
     *                 face:    first faces will be detect if no faces were passed to the «loadImage»
     *                          method, then the image will be cropped at the optimal position so
     *                          that the most relevant parts of the images will be on the new image
     */
    , resize: function(options){
        var mode    = options.mode || 'crop',
            height  = options.height || this.getHeight(),
            width   = options.width || this.getWidth(),
            strat;

        switch(mode){
            case 'fit':
                strat = new resizing.FittingStrategy();
                break;
            case 'disort':
                strat = new resizing.DisortingStrategy();
                break;
            case 'face':
                return this;
            // crop
            default:
                strat = new resizing.DefaultStrategy();
                break;
        }
        strat.execute(this, width, height, options);
        return this;
    }

    , _pixelSizes: {
        'rgb':      3,
        'rgba':     4,
        'grey':     1,
        'greya':    2
    }
    , convertColor: function(color, toModel){
        var targetLength            = {gray: 1, graya: 2, rgb: 3, rgba: 4}[toModel] || 4,
            targetHasAlpha          = (targetLength % 2 == 0),

            colorLength             = color.length,
            colorLast               = colorLength - 1,
            colorHasAlpha           = (colorLength % 2 == 0),
            colorNew                = color,

            diff                    = targetLength - colorLength,
            needConversion          = diff < 0 || (colorHasAlpha && !targetHasAlpha),
            alpha                   = (colorHasAlpha) ? color[colorLast] : 0xFF;

        // not able to convert
        if(needConversion) { return null; }

        // sanitize alpha
        if(targetHasAlpha) {
            alpha = (alpha<=1) ? Math.floor(alpha * 255) : alpha;
            if(colorHasAlpha){
                colorNew[colorLast] = alpha;
            } else {
                colorNew.push(alpha);
            }
        }
        // already good
        if(diff == 0) { return colorNew; }
        // gray values to rgb
        if(diff>1) {
            colorNew.unshift(colorNew[0]);
            colorNew.unshift(colorNew[0]);
        }

        return colorNew;
    }
    , _computePadding: function(data, color, fullWidth, left, right, top, bottom){

        var canFill         = color.length < 2,
            colorDefault    = color.length == 1 ? color[0] : 0x00,
            colorBytes      = this._pixelSizes[data.pixel],
            colorHasAlpha   = color.length !== 0 && (color.length % 2 == 0);

        if(!color.length){
            for(var i=0; i<colorBytes; i++){
                color.push(colorDefault);
            }
        } else {
            color = this.convertColor(color, data.pixel);
        }

        var psize       = color.length,
            // rounded to the next multiple of 4
            stride      = ((fullWidth * psize + 3) & ~3),
            buffers     = { 'emptyLine': new Buffer(stride)
                            , 'leftPad': new Buffer(left*psize)
                            , 'rightPad': new Buffer(stride - data.width * psize - left * psize) };
        // single color channel
        if(canFill){
            for(var buffer in buffers){
                buffers[buffer].fill(colorDefault);
            }
        } // multiple color channels
        else {
            for(var buffer in buffers){
                for(var i=0; i<buffers[buffer].length; i++){
                    buffers[buffer].writeUInt8(color[i%psize], i);
                }
            }
        }

        return buffers;
    }
    , pad: function(options){
        /**
         * @todo add a color conversion if the applied color contains more color channels than the original
         */
        var left    = options.left || options.right || 0,
            right   = options.right || options.left || 0,
            top     = options.top || options.bottom || 0,
            bottom  = options.bottom || options.top || 0,
            color = options.color || [];

        this.height = top + this.getHeight() + bottom;
        this.width  = left + this.getWidth() + right;

        this.push(function(error, data, options){
            if(error){
                this.callFinal(error);
            } else if (top || left){
                /**
                 * @todo: add color conversion
                 */
                var rows        = [],
                    iterations  = data.height,
                    fullWidth   = data.width + left + right,
                    fullHeight  = data.height + top + bottom,
                    buffers     = this._computePadding(data, color, fullWidth, left, right, top, bottom),
                    padded;

                for(var i=0; i<top; i++){
                    rows.push(buffers.emptyLine);
                }

                for(var i=0; i < iterations; i++){
                    // row does not include the padding for the stride
                    rows.push(Buffer.concat([buffers.leftPad, data.row(i), buffers.rightPad]));
                }

                for(var i=0; i<bottom; i++){
                    rows.push(buffers.emptyLine);
                }

                padded = Buffer.concat(rows);
                this.setWrapped(new picha.Image({width:fullWidth, height: fullHeight, data: padded, pixel: data.pixel}));
                this.callNext(null, this._getWrapped(), options);
            } else { // no padding, ignore it
                this.callNext(null, data, options);
            }
        });
        return this;
    }
    
    , _changeDimensions: function(width, height, filter) {
        this.width = width;
        this.height = height;

        this.push(function(error, data, options){
            if(error){
                this.callFinal(error);
            } else {
                var opts = {width: width, height: height, filter: filter};
                picha.resize(
                    data,
                    opts,
                    function(err, result){
                            if(err){
                                this.callFinal(err);
                            } else {
                                this.setWrapped(result);
                                this.callNext(null, result, options);
                            }
                    }.bind(this)
                );
            }
        });
        return this;
    }

    /**
     * The stat() method returns the image dimensions and additional available image meta data
     * of the original image.
     */
    , stat: function(){
        if(!this.stats){
            this.stats = picha.stat(this.buffer);
        }
        return this.stats;
    }

    /**
     * the faces() method returns the reference to the image instance( support for method chaining )
     * it executes face detection on the image, but only if no face data was passed to the
     * «loadImage» method and no prior call to the «faces» method was done.
     * if the faces method is called more than once all succesive calls will either return the
     * cached data or wait until the first call to the «faces» method was executed.
     *
     * @param <Function> callback, function(err, faces){}, err = Error, faces = Array
     */
    , faces: function(callback){

    }
    /**
     * Decodes the image buffer, it is always the first step in the chain, and is therefore not pushed on the stack.
     *
     * @param buffer
     * @param callback
     * @private
     */
    , _decode: function(buffer, callback, options){
        if(!this._getWrapped()){
            picha.decode(buffer, callback);
        } else {
            callback(null, this._getWrapped(), options);
        }
    }

    /**
     * Encoding is always the last step in the chain, and is therefore not pushed on the stack.
     *
     * @param err
     * @param data
     * @param options
     * @returns {exports}
     * @private
     */
    , _encode: function(quality, format){
        this.push(function(err, data, opts){
            if(err){
                this.callFinal(err);
            } else {
                switch(format){
                    case 'png':
                    case 'image/png':
                        picha.encodePng(data, this.next());
                        break;
                    case 'tiff':
                    case 'image/tiff':
                        picha.encodeTiff(data, this.next());
                        break;
                    case 'webp':
                    case 'image/webp':
                        picha.encodeWebP(data, this.next());
                        break;
                    default:
                        picha.encodeJpeg(data, {quality: quality}, this.next());
                        break;
            }
        }
        });
    }
    /**
     * 1. First decode the image (only if necessary!)
     * 2. Hook in the final encoding
     * 3. Add a cleanup (we need to reset the stack)
     * 4. Execute with the callback
     *
     * the toBuffer() method returns the reference to the image instance( support for method
     * chaining ). it executes all cached commands and calls the callback when finished.
     * Arguments passed to this method can be in any order.
     *
     * @param <String> format, optional, defaults to «jpg», can be one of «png» and «jpg»
     * @param <Number> format, optional, defaults to 75, the jpeg quality
     * @param <Function> callback, function(err, newImage, faces){} err = Error, newImage = buffer,
     *                   faces = Array, faces is only present if face detection was used.
     */
    , toBuffer: function(format, quality, callback){
        var args    = new arg(arguments);
        var form    = args.get('string', this.stat().mimetype),
            qual    = args.get('number', 75),
            cb      = args.get('function');

        if(!cb){
            throw new Error('Please provide a valid callback to WorkerImage.toBuffer');
        }

        // push the encoding to the stack
        this._encode(qual, form);
        this._decode(this.buffer, function(err, result){
            if(err){
                this.callFinal(err);
            } else {
                this.setWrapped(result);
                // push the final encoding action onto the stack (this is Bullshit!!)
                this.execute(cb, err, this._getWrapped(), {});
            }
        }.bind(this));
    }
});