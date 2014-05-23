var   Class 		= require('ee-class')
    , log 			= require('ee-log')
    , FluentInterface = require('./FluentInterface')
    , assert = require('assert');

/**
 * A stack-like implementation to create fluent interfaces that allow lazy method execution.
 * This implementation shifts the executed methods from the storage so they get executed only once.
 *
 * @type {Class}
 */
var FluentStack = module.exports = new Class({

    inherits: FluentInterface

    /**
     * Increases the internal offset and returns the next callback on the stack,
     * or the last callback passed to the execution procedure. Use this method to increase
     * the iterator (and gain access to the next method).
     *
     * @returns {*}
     */
    , next: function(){
        var pre = this.length,
            next = this.shift(),
            post = this.length;
        assert(pre > post || this.length === 0, "Length of stack should decrease when calling next.");
        return (next) ? next : this._stackEnd;
    }

    /**
     * Returns the current method on the stack, including the final callback.
     * Use this method to pass the current callback e.g. to a library.
     *
     * @returns the current item on the stack
     */
    , current: function(){
        return this._valid() ? this[0] : this._stackEnd;
    }

    /**
     * Returns true if the current offset is a valid offset.
     * @private
     */
    , _valid: function() {
        return this.length > 0;
    }

    /**
     * Returns true if the iterator has any remaining items, including the final callback.
     * @returns {*|null}
     */
    , hasNext: function(){
        return (this._hasNextWithoutLast() || this._stackEnd);
    }

    /**
     * Returns true if the iterator has any remaining items without the final callback.
     * @returns {*|boolean}
     * @private
     */
    , _hasNextWithoutLast: function(){
        return this._valid()
    }

    /**
     * Rewinds the internal offset.
     */
    , rewind: function(){}
});