"use strict";

var   Class     = require('ee-class')
    , types     = require('ee-types')
    , log       = require('ee-log');

/**
 * A pipeline of actions performed on an image.
 *
 * @todo:   create a chain before the invocation to avoid collisions during its invocation (make the invocation stateless)
 *          to achieve that we could also clone the pipeline before we execute it, but this would introduce overhead
 */
var Pipeline = module.exports = new Class({

      stages: null
    , length: { get: function(){
        return this.stages.length;
    }}

    , init: function init(stages){
        this.stages = types.array(stages) ? stages : [];
    }

    , append: function(callback) {
        this.stages.push(callback);
        return this;
    }

    , prepend: function(callback){
        this.stages.unshift(callback);
        return this;
    }

    , clear: function(){
        this.stages = [];
        return this.rewind();
    }

    /**
     * @deprecated
     */
    , rewind: function(){
        return this;
    }

    , invoke: function(data, callback){
        this._invokeStages(null, data, callback, this.stages.slice());
    }

    , _invokeStages: function(err, data, final, stages){
        var next = stages.shift();
        if(err || !next) return final(err, data);
        next(data, function(error, result){
            return this._invokeStages(error, result, final, stages);
        }.bind(this));
    }
});