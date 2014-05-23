var   Class 		= require('ee-class')
    , log 			= require('ee-log');

/**
 * A stack-like implementation to create fluent interfaces that allow lazy method execution. The
 * passed actions are bound do the scope of the object, and need to call this.callNext(args), or get the next
 * function using the next() method (which includes the final callback). This stack does not
 * get empty during it's execution and can be re-evaluated.
 *
 * @type {Class}
 */
var FluentInterface = module.exports = new Class({

    inherits: Array
    , _offset: 0
    , _stackEnd: null

    /**
     * Increases the internal offset and returns the next callback on the stack,
     * or the last callback passed to the execution procedure. Use this method to increase
     * the iterator (and gain access to the next method).
     *
     * @returns {*}
     */
    , next: function(){
        this._offset++;
        return this.current();
    }

    /**
     * Returns the current method on the stack, including the final callback.
     * Use this method to pass the current callback e.g. to a library.
     *
     * @returns the current item on the stack
     */
    , current: function(){
        return this._valid() ? this[this._offset] : this._stackEnd;
    }

    /**
     * Returns true if the current offset is a valid offset.
     * @private
     */
    , _valid: function() {
        return this.length > 0 && this._offset <= this.length-1;
    }

    /**
     * Returns true if the iterator has any remaining items, including the final callback.
     * @returns {*|null}
     */
    , hasNext: function(){
        return this._hasNextWithoutLast() || this._stackEnd;
    }

    /**
     * Returns true if the iterator has any remaining items without the final callback.
     * @returns {*|boolean}
     * @private
     */
    , _hasNextWithoutLast: function(){
        return this._valid() && this._offset !== this.length-1
    }

    /**
     * Rewinds the internal offset.
     */
    , rewind: function(){
        this._offset = 0;
    }

    /**
     * Sets up the passed callback as a one time callback and calls the first callback on the
     * stack.
     *
     * @param callback
     */
    , execute: function(callback){
        /**
         * Wrap the final callback in a function that gets called only once.
         * @type {function(this:exports)}
         * @private
         */
        this._stackEnd = function(){
            this.rewind();
            this._stackEnd = null;
            callback.apply(undefined, Array.prototype.slice.call(arguments));
        }.bind(this);

        this._offset = -1;
        this.callNext.apply(this, Array.prototype.slice.call(arguments, 1));
    }

    /**
     * Call the next function on the stack.
     */
    , callNext: function(){
        if(this._hasNextWithoutLast()){
            this.next().apply(this, Array.prototype.slice.call(arguments));
        } else {
            this.callFinal.apply(this, Array.prototype.slice.call(arguments));
        }
    }

    /**
     * Call the final function on the stack if the execution terminates e.g. in the case
     * of an error.
     */
    , callFinal: function(){
        this._stackEnd.apply(undefined, Array.prototype.slice.call(arguments));
    }

    , clear: function(){
        this.rewind();
        while(this.length > 0){
            this.pop();
        }
        this.rewind();
        this._stackEnd = null;
    }
});