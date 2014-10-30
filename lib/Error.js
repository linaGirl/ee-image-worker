var Class = require('ee-class');

var codes = {};
codes.UNKNON_ERROR           = 0;
codes.INVALID_IMAGE_FORMAT   = 1;
codes.INVALID_IMAGE_STATE    = 2;
codes.INVALID_DIMENSIONS     = 3;
codes.INVALID_COLOR_FORMAT   = 4;
codes.NOT_SUPPORTED          = 5;
codes.INVALID_STATE          = 6;

module.exports.codes = codes;

var BaseError = module.exports.BaseError = new Class({

      inherits  : Error
    , stack     : null
    , code      : codes.UNKNON_ERROR
    , original  : null

    , init      : function init(code, name, message, original, constructor){
        Error.captureStackTrace(this, constructor || init);
        this.code       = code || this.code;
        this.name       = name || 'Unknown Error';
        this.original   = original;
        this.message    = message;
        if(!message && original){
            this.message = original.message;
        }
    }
});

module.exports.ImageFormatError = new Class({

      inherits  : BaseError

    , init      : function init(message, original){
        init.super.call(this,
            codes.INVALID_IMAGE_FORMAT,
            'Unsupported Image Format',
            message,
            original,
            init);
    }
});
var StateError = module.exports.StateError = new Class({

    inherits  : BaseError

    , init      : function init(message, original){
        init.super.call(this,
            codes.INVALID_STATE,
            'Invalid State',
            message,
            original,
            init);
    }
});

module.exports.ImageStateError = new Class({

      inherits  : BaseError

    , init      : function init(message, original){
        init.super.call(this,
            codes.INVALID_IMAGE_STATE,
            'Invalid Image State',
            message,
            original,
            init);
    }
});

module.exports.DimensionError = new Class({

      inherits  : BaseError

    , init      : function init(message, original){
        init.super.call(this,
            codes.INVALID_IMAGE_STATE,
            'Invalid Dimensions',
            message,
            original,
            init);
    }
});

module.exports.ColorFormatError = new Class({

    inherits  : BaseError

    , init      : function init(message, original){
        init.super.call(this,
            codes.INVALID_COLOR_FORMAT,
            'Invalid Color Format or Conversion',
            message,
            original,
            init);
    }
});

module.exports.NotSupportedError = new Class({

    inherits  : BaseError

    , init      : function init(message, original){
        init.super.call(this,
            codes.NOT_SUPPORTED,
            'Unsupported Operation',
            message,
            original,
            init);
    }
});

