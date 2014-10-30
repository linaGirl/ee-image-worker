var   Image             = require('./lib/Image')
    , Transformation    = require('./lib/Transformation')
    , engines           = require('./lib/engine')
    , errors            = require('./lib/Error');

var defaultEngine = new engines.PichaEngine();

module.exports.createImage = function(buffer, engine){
    return new Image(buffer, engine || defaultEngine);
};
module.exports.createTransformation = function(engine){
    return new Transformation(engine || defaultEngine);
};

module.exports.errors = errors;