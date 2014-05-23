var classes = {
    AbstractStrategy:   require('./AbstractStrategy'),
    CroppingStrategy:   require('./CroppingStrategy'),
    FittingStrategy:    require('./FittingStrategy'),
    DisortingStrategy:  require('./DisortingStrategy')
}

module.exports = classes;
module.exports.DefaultStrategy = classes.CroppingStrategy;
