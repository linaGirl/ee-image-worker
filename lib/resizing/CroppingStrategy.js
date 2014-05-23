var AbstractStrategy    = require('./AbstractStrategy')
    , Class             = require('ee-class');

/**
 * A basic resizing strategy that computes resizing data proportionally.
 */
var CroppingStrategy = new Class({

      inherits: AbstractStrategy
    , execute: function(workerImage, width, height, options){
        var filter      = options.filter || workerImage.FILTER_LANCZOS,
            background  = options.background || null;

        var data = this.computeResizingData(workerImage.getWidth(), workerImage.getHeight(), width, height);
        workerImage._changeDimensions(data.width, data.height, filter);
        workerImage.crop({top: data.y, left: data.x, width: width, height: height});
    }
    /**
     * Assumes that the image gets resized proportionally and then cropped.
     * Returns the width and height to resize to and the x and y values of the upper
     * left corner of the new view.
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
        var	Ro = origW / origH,
            Rn = newW / newH,
            height,
            width,
            x = 0,
            y = 0;

        if(Ro >= Rn) {
            height = newH;
            width = height * Ro;
            if(Ro != Rn) {
                // crop width
                x = (newW - width) / 2;
            }
        } else {
            width = newW;
            height = width / Ro;
            if(Ro != Rn) {
                // crop height
                y = (newH - height) / 2;
            }
        }
        return this.result(width, height, x, y);
    }
});

CroppingStrategy.key = 'crop';
module.exports = CroppingStrategy;