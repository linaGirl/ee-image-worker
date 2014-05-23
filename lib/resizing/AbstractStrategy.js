var Class   = require('ee-class');
/**
 * Base class for resizing strategies. Additional dependencies should be 
 * specific to the implemented strategy.
 */
var AbstractStrategy = new Class({

      computeResizingData: function(){
	    throw new Error('Method not implemented');
      }

    , execute: function(workerImage){
        throw new Error('Method not implemented');
    }

    , result: function(resizeW, resizeH, x, y){
	    return {
		    'width': Math.round(resizeW),
		    'height': Math.round(resizeH),
		    'x': Math.floor(Math.abs(x)),
		    'y': Math.floor(Math.abs(y))
	    };
    }
});

AbstractStrategy.key = 'abstract';
module.exports = AbstractStrategy;