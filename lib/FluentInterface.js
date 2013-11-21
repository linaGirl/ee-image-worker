var   Class 		= require('ee-class')
    , log 			= require('ee-log');


/**
 * A stack-like implementation to create fluent interfaces that allow lazy method execution. The
 * passed actions are bound do the scope of the object, and need to call this._callNext(args)
 * @type {Class}
 */
var FluentInterface = module.exports = new Class({

    inherits: Array
    , _offset: 0
    , _stackEnd: null

    , next: function(){
        this._offset++;
        return this.current();
    }

    , current: function(){
        return this[this._offset];
    }

    , hasNext: function(){
        return this.length > 0 && this._offset < this.length-1;
    }

    , rewind: function(){
        this._offset = 0;
    }

    , execute: function(callback){
        this._stackEnd = callback;
        this._offset = -1;
        this._callNext.apply(this, Array.prototype.slice.call(arguments, 1));
    }

    , _callNext: function(){
        if(this.hasNext()){
            this.next().apply(this, Array.prototype.slice.call(arguments));
        } else {
            this._callFinal.apply(this, Array.prototype.slice.call(arguments));
        }
    }
    , _callFinal: function(){
        this.rewind();
        var end = this._stackEnd;
        var undef;
        this._stackEnd = null;
        end.apply(undef, Array.prototype.slice.call(arguments));
    }
});