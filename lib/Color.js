"use strict";

var   Class     = require('ee-class')
    , types     = require('ee-types')
    , log       = require('ee-log');

var Color = module.exports = new Class({});

Color.models = {
      rgba    : 4
    , rgb     : 3
    , greya   : 2
    , grey    : 1
};

Color.resolveModel = function(bytes){
    switch(bytes.length){
        case Color.models.rgb   : return 'rgb';
        case Color.models.greya : return 'greya';
        case Color.models.grey  : return 'grey';
        case Color.models.rgba  :
        default:
            return 'rgba';
    }
};

Color.resolveByteLength = function(model){
    return Color.models[model];
};