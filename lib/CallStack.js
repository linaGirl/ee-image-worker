var   Class 		= require('ee-class')
    , log 			= require('ee-log');


/**
 * A call stack is basically an array, which chains and executes callbacks.
 * @type {Class}
 */
var CallStack = module.exports = new Class({

    inherits: Array,
    execute: function(callback){
        var invoker = callback;
        for(var i = this.length-1;i >= 0; i--) {
            var wrapper = function(callback){
                this[i].apply()
            };
        }
    }
});