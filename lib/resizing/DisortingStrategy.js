var AbstractStrategy    = require('./AbstractStrategy')
    , Class             = require('ee-class');

/**
 * A basic resizing strategy that computes resizing data proportionally.
 */
var DisortingStrategy = new Class({

      inherits: AbstractStrategy

    , execute: function(workerImage, width, height, options){
        var filter      = options.filter || workerImage.FILTER_LANCZOS,
            data        = this.computeResizingData(workerImage.getWidth(), workerImage.getHeight(), width, height);

        workerImage._changeDimensions(data.width, data.height, filter);
    }

    , computeResizingData: function(origW, origH, newW, newH){
        return this.result(newW, newH, 0, 0);
    }
});

DisortingStrategy.key = 'disort';
module.exports = DisortingStrategy;