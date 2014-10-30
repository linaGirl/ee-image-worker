module.exports.AbstractEngine   = require('./abstract');

var PichaEngine = module.exports.PichaEngine = require('./picha');
module.exports.DefaultEngine    = new PichaEngine();