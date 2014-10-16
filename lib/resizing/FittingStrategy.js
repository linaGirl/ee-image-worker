var AbstractStrategy    = require('./AbstractStrategy')
    , Class             = require('ee-class');

var FittingStrategy = new Class({

      inherits: AbstractStrategy

    , execute: function(workerImage, width, height, options){
        var filter      = options.filter || workerImage.FILTER_LANCZOS,
            background  = options.background || null;

        var data = this.computeResizingData(workerImage.getWidth(), workerImage.getHeight(), width, height);
        workerImage._changeDimensions(data.width, data.height, filter);
        workerImage.pad({'left':data.x, 'top':data.y, 'color':background});
    }

    /**
     * Fits the image proportionally into the bounding box. The x and y values describe the necessary
     * padding.
     *
     * @param int origW original with in pixels
     * @param int origH original height in pixels
     * @param int newW target width in pixels
     * @param int newH target height in pixels
     *
     * @returns {width, height, x, y}
     */
    , computeResizingData: function(origW, origH, newW, newH){
        /**
         * Compute the aspect ratios.
         * ratio > 1	-> landscape
         * ratio <= 1	-> portrait or square
         */
        var	Ro = origW / origH, // ratio of the original image
            Rn = newW / newH,   // ratio of the new image
            height,
            width,
            x = 0,
            y = 0;

        if(Ro >= Rn) {
            width = newW;
            height = width / Ro;
            if(Ro != Rn) {
                // padding width
                y = (newH - height) / 2;
            }
        } else {
            height = newH;
            width = height * Ro;
            if(Ro != Rn) {
                // padding width
                x = (newW - width) / 2;
            }
        }
        return this.result(width, height, x, y);
    }
});

FittingStrategy.key = 'fit';
module.exports = FittingStrategy;