"use strict";

var   Class     = require('ee-class')
    , types     = require('ee-types')
    , log       = require('ee-log');

var Pipeline = module.exports = new Class({

      stages: null
    , length: { get: function(){
        return this.stages.length;
    }}
    , position: null

    , init: function init(stages){
        this.stages = types.array(stages) ? stages : [];
        this.position = -1;
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

    , rewind: function(){
        this.position = -1;
        return this;
    }

    , next: function(){
        this.position++;
        return this.stages[this.position];
    }

    , invoke: function(data, callback){
        this._invokeNext(null, data, callback);
    }

    , _invokeNext: function(err, data, final){
        var next = this.next();
        if(err || !next) return final(err, data);
        next(data, function(error, result){
            this._invokeNext(error, result, final);
        }.bind(this));
    }
});