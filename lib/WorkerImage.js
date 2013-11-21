var Class   = require('ee-class'),
    log     = require('ee-log'),
    picha   = require('picha'),
    FluentInterface = require('./FluentInterface');

var WorkerImage = module.exports = new Class({

    inherits: FluentInterface

    , FILTER_LANCZOS:     'lanczos'
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

    , init: function initialize(buffer, options){
        this.buffer = (buffer) ? buffer: new Buffer('');
        this.options = options;
    }

    , setWrapped: function(wrapped){
        this.wrapped = wrapped;
    }

    , _getWrapped : function(){
        if(!this.wrapped){
            this.wrapped = picha.decode(this.buffer);
        }
        return this.wrapped;
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
            left    = options.left || 0,
            height  = options.height || this.height,
            width   = options.width || this.width;

            this.top += top;
            this.left += left;
            this.height = height;
            this.width = width;

            this.push(function(err, data, options){
                if(err){
                    this._callFinal(err);
                }
                try {
                    var sub = data.subView(top, left, height, width);
                    this._callNext(null, sub, options);
                } catch (error){
                    this._callFinal(error);
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
        var height  = options.height || this.height,
            width   = options.width || this.width,
            mode    = options.mode || 'crop',
            filter  = options.filter || this.FILTER_LANCZOS;

        switch(mode){
            case 'fit':
                /**
                 * 1. Compute the resizing of the image.
                 * 2. If the image is too small, allocate a new image of the desired size (in rgba mode)
                 * 3. Copy the image data into the new image (hope this is possible with picha)
                 *
                 */
                break;
            case 'disort':
                this._changeDimensions(width, height, filter);
                break;
            case 'face':
                break;
            // crop
            default:
                break;
        }
        return this;
    }

    , _changeDimensions: function(width, height, filter) {
        this.width = width;
        this.height = height;

        this.actions.push(function(callback){
            this._getWrapped().resize(this.wrapped, {width: width, height: height, filter: filter},
                function(err, result){
                    if(!err){
                        this.wrapped = result;
                    }
                    callback(err, result);
                }.bind(this));
        }.bind(this));
    }

    /**
     * The stat() method returns the image dimensions and additional available image meta data
     * of the original image.
     */
    , stat: function(options){
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
        // add the encoding function on the stack
        this.execute(callback, null, this._getWrapped(), {});
    }
});