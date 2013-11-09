var Class   = require('ee-class'),
    log     = require('ee-log'),
    picha   = require('picha');

var WorkerImage = module.exports = new Class({

    defaultFilter: 'lanczos',

    top: 0,
    left: 0,

    originalWidth: null,
    originalHeight: null,

    width: 0,
    height: 0,
    stats: null,
    wrapped: null,

    actions: []

    , init: function initialize(buffer, options){
        this.buffer = (buffer) ? buffer: new Buffer();
        this.options = options;
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
        var top     = options.top,
            left    = options.left,
            height  = options.height,
            width   = options.width;

        this.top += top;
        this.left +=left;
        this.height = height;
        this.width = width;

        this.actions.push(function(callback){
            this.wrapped = this._getWrapped().subView(top, left, height, width);
        }.bind(this));

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
     *                 distort: the image is ditortet into the box
     *                 face:    first faces will be detect if no faces were passed to the «loadImage»
     *                          method, then the image will be cropped at the optimal position so
     *                          that the most relevant parts of the images will be on the new image
     */
    , resize: function(options){
        var height  = options.height,
            width   = options.width,
            mode    = options.mode;

        switch(mode){
            case 'fit':
                break;
            case 'disort':

                break;
            case 'face':
                break;
            // crop
            default:
                break;
        }
        return this;
        /**
         * 1. Load strategy.
         * 2. Pass the image to the strategy
         * 3. The strategy applies the necessary actions.
         */
    }

    , _changeDimensions: function(width, height, callback, quality, filter) {
        this.width = width;
        this.height = height;

        this.actions.push(function(callback){
            this._getWrapped().resize(this.wrapped, {width: width, height: height, filter: filter, quality: quality},
                function(err, result){
                    if(!err){
                        this.wrapped = result;
                    }
                    callback(err, result);
                }.bind(this));
        }.bind(this));
    }

    /**
     * the stat() method returns the image dimensions and additional available image meta data
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

    }

    , _executeActions: function(actions){
        var len = this.actions.length;
        if(len){
            var action = actions[0],
                next;
        }
    }
});