"use strict";

var   Class     = require('ee-class')
    , types     = require('ee-types')
    , log       = require('ee-log')

    , Focus     = require('./Focus');

/**
 * Represents the bounds of an image and wraps functionality for
 * comparing and approximation of different bounds.
 *
 * @todo: integrate more sophisticated focus treatment (not only point wise)
 */
var Bounds = module.exports = new Class({

      width : 0
    , height: 0
    , focus : null

    , init: function init(width, height, focus){
        this.width  = width;
        this.height = height;
        this.focus  = focus || new Focus(parseInt(width / 2, 10), parseInt(height / 2, 10));
    }

    , aspectRatio: function(){
        return this.width / this.height;
    }
    , isLandscape: function(){
        return this.aspectRatio() > 1;
    }

    , isPortrait: function(){
        return this.aspectRatio() <= 1;
    }

    , resize: function(width, height){
        var ratioW      = width / this.width
            , ratioH    = height / this.height;

        this.width  = width;
        this.height = height;

        return this.adjustFocus(ratioW, ratioH);
    }

    , scale: function(ratio){
        this.width *= ratio;
        this.height *= ratio;
        return this.adjustFocus(ratio, ratio);
    }

    , scaleToWidth: function(width){
        return this.scale(width / this.width);
    }

    , scaleToHeight: function(height){
        return this.scale(height / this.height);
    }

    , focusOn: function(focus){
        return this.setFocus(focus);
    }

    , setFocus: function(focus){
        this.focus = focus;
        return this;
    }

    , getFocus: function(){
        return this.focus;
    }

    , adjustFocus: function(ratioWidth, ratioHeight){
        if(this.focus) this.focus.adjust(ratioWidth, ratioHeight);
        return this;
    }
    /**
     * We could probably express the two actions using each other!
     * e.g. filling is fitting the bounding box into me and taking the max values?
     */
    , fit: function(bounds){
        if(this.aspectRatio() >= bounds.aspectRatio()){
            // collect the ratios
            return this.resize(bounds.width, bounds.width / this.aspectRatio());
        }
        return this.resize(bounds.height * this.aspectRatio(), bounds.height);
    }
    /**
     * @param bounds
     * @returns {*}
     */
    , fill: function(bounds){
        if(this.aspectRatio() >= bounds.aspectRatio()){
            return this.resize(bounds.height * this.aspectRatio(), bounds.height);
        }
        return this.resize(bounds.width, bounds.width / this.aspectRatio());
    }

    , fitsInto: function(bounds){
        return this.width <= bounds.width && this.height <= bounds.height;
    }
    /**
     * Cases:
     *  - If frame contains image -> focus point is included
     *  - If image contains frame ->
     *      -- compute direction (vector)
     *      -- for x and y do:
     *          -- if direction is positive, take the minimal achievable value (of the frame)
     *          -- if direction is negative, take the maximal achievable value (of the frame)
     *  - other cases...
     */
    , adjustToFocusOf: function(bounds){
        // seen from the view of an image, starting at the top left corner
        var   diff = this.focusVector(bounds)
            , pad  = {
                  left  : 0
                , top   : 0
                , right : 0
                , bottom: 0
            };

        if(this.fitsInto(bounds)){  // image fits into the frame
            if(diff.x < 0){
                pad.right = bounds.width - this.width;
            } else {
                var   toRightBorder = this.width - this.focus.x
                    , minX          = Math.min(bounds.focus.x, bounds.width - toRightBorder);
                // distance to the left border of the frame
                pad.left = minX - this.focus.x;
                // distance to the right border of the frame
                pad.right = bounds.width - minX - toRightBorder;
            }
            if(diff.y < 0){
                pad.bottom = bounds.height - this.height;
            } else {
                var   toBottomBorder = this.height - this.focus.y
                    , minY         = Math.min(bounds.focus.y, bounds.height - toBottomBorder);
                pad.top = minY - this.focus.y;
                pad.bottom = bounds.height - minY - toBottomBorder;
            }
            return pad;
        }
        if(bounds.fitsInto(this)){
            var pad     = bounds.adjustToFocusOf(this);
            pad.left    *= -1;
            pad.right   *= -1;
            pad.bottom  *= -1;
            pad.top     *= -1;
            return pad;
        }

        var   toLeftBorder      = this.focus.x
            , toRightBorder     = this.width - this.focus.x
            , toTopBorder       = this.focus.y
            , toBottomBorder    = this.height - this.focus.y;

        if(diff.x < 0){

            var maxX = Math.max(bounds.focus.x, bounds.width - toLeftBorder);

            pad.left = maxX - toLeftBorder;
            pad.right = bounds.width - maxX - toRightBorder;
        } else {
            var minX = Math.min(bounds.focus.x, bounds.width - toRightBorder);

            pad.right = bounds.width - minX - toRightBorder;
            pad.left  = bounds.width - minX - toLeftBorder;
        }

        if(diff.y < 0){
            var maxY = Math.max(bounds.focus.y, bounds.height - toBottomBorder);

            pad.top     = maxY - toTopBorder;
            pad.bottom  = bounds.height - maxY - toTopBorder;
        } else {
            var minY = Math.min(bounds.focus.y, bounds.height - toBottomBorder);

            pad.top     = minY - toTopBorder;
            pad.bottom  = bounds.height - minY - toBottomBorder;
        }

        return pad;
    }

    , focusVector: function(bounds){
        return {
              x : bounds.focus.x - this.focus.x
            , y : bounds.focus.y - this.focus.y
        };
    }

    , clone: function(){
        return new Bounds(this.width, this.height, this.focus.clone());
    }
});