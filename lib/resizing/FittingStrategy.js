var AbstractStrategy    = require('./AbstractStrategy')
    , Class             = require('ee-class');

var FittingStrategy = module.exports = new Class({

    inherits: AbstractStrategy

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
        var	Ro = origW / origH,
            Rn = newW / newH,
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
