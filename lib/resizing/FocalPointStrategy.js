"use strict";

var Class = require('ee-class');

var FocalAreaStrategy = {

      inherits: AbstractStrategy
    , strategy : null
    , name: 'focus'

    , init: function initialize(strategy) {
        this.strategy = strategy;
    }
};

module.exports = new Class(FocalAreaStrategy);