/*!
 * _____________Bottom_Line._.⌡S___
 * Bottom_line JavaScript Library
 *
 * Copyright 2013, Rogier Geertzema
 * Released under the MIT license
 * ________________________________
 */

var console = {
	log: Log.debug,
	warn: Log.warning,
	error: Log.error
};

'use strict';
!function(root, bottom_line) {
	if(typeof(define) === 'function' && define.amd)
	{
		define(bottom_line);
	}
	else if(typeof(module) === 'object' && typeof(exports) === 'object' && module.exports === exports)
	{
		module.exports = bottom_line();
	}
	else
	{
		root._ = bottom_line();
	}
}(this, function() {
	/**
	 * bottom_line: base module. This will hold all type objects: obj, arr, num, str, fnc, math
	 * Also all static properties (including native ones) will be available on this object
	 *
	 * @module _
	 */
	var _ = {};

	// some short cuts
	var __obj  = Object;
	var __arr  = Array;
	var __num  = Number;
	var __str  = String;
	var __fnc  = Function;
	var __math = Math;

	/**
	 * Constructs the wrapper objects
	 *
	 * @private
	 * @method
	 * @param   {Object|null} nativeObj - Native base object. Pass null if none
	 * @param   {string}      shorthand - Boolean indicating if we should invert the condition
	 * @param   {Object}      module    - function to be executed on a match
	 */
	function constructWrapper(nativeObj, shorthand, module)
	{
		// set wrapper object
		var wrapperObj = _[shorthand] = module.init || function(value) {};

		// copy native statics to wrapper object & _ for easy use
		if(nativeObj)
		{
			__obj.getOwnPropertyNames(nativeObj).forEach(function(name) {
				if(!/^length|name|arguments|caller|prototype$/.test(name))
				{
					var descriptor = __obj.getOwnPropertyDescriptor(nativeObj, name);

/*					if(wrapperObj.hasOwnProperty(name)) console.warn('overwriting existing property: '+name+' on _.'+shorthand+' while copying native statics');
					if(_.hasOwnProperty(name)) console.warn('overwriting existing property: '+name+' on _ while copying native statics, for shorthand: '+shorthand);*/

					__obj.defineProperty(wrapperObj, name, descriptor);
					__obj.defineProperty(_,          name, descriptor);
				}
			});
		}

		// copy statics to wrapper & _
		var statics = module.static || {};
		__obj.getOwnPropertyNames(statics).forEach(function(name) {
			var descriptor = __obj.getOwnPropertyDescriptor(statics, name);

			descriptor.enumerable = false;

			//if(wrapperObj.hasOwnProperty(name)) console.warn('overwriting existing property: '+name+' on _.'+shorthand+' while copying statics');

			__obj.defineProperty(wrapperObj, name, descriptor);

			// copy static properties to the bottom line _ object
			if(shorthand !== 'int') // except for the int class
			{
				//if(_.hasOwnProperty(name)) console.warn('overwriting existing property: '+name+' on _ while copying statics');

				__obj.defineProperty(_, name, descriptor);
			}
		});

		// prototype
		var prototype = module.prototype || {};
		__obj.getOwnPropertyNames(prototype).forEach(function(name) {
			var descriptor = __obj.getOwnPropertyDescriptor(prototype, name);

			descriptor.enumerable = false;

			//if(nativeObj.prototype.hasOwnProperty(name)) console.warn('overwriting existing property: '+name+' on _.'+nativeObj+' while copying prototype methods');

			__obj.defineProperty(nativeObj.prototype, name, descriptor);
		})
	}

	/*
	 *  'Global' methods
	 */
	_.assert = function(condition, message)
	{
		if (!condition)
		{
			throw message || "Assertion failed";
		}
	};

	/**
	 * Collections general collection object to store general collection functions
	 *
	 * @private
	 */
	var __coll = {
		/**
		 * Edits the key valuer pairs of an object
		 * @private
		 * @this    {Array|Object}
		 * @param   {boolean}            all     - Boolean indicating if we should remove the first occurrence only
		 * @param   {boolean}            invert  - Boolean indicating if we should invert the condition
		 * @param   {Function}           onmatch - function to be executed on a match
		 * @param   {boolean}            reverse - Boolean indicating if we should use inverse iteration
		 * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | function
		 * @param   {Object}             opt_ctx - optional context for the function
		 * @returns {Array}                      - new array with the copied elements
		 */
		__edit: function(all, invert, onmatch, reverse, target, $value, opt_ctx)
		{
			var first = !all, normal = !invert;
			var array, match, finish = false;

			var cb = (typeof($value) === 'function')? 	$value                                  :
					 (array = _.isArray($value))? 		function(val) {return $value._has(val)} :
														function(val) {return val === $value};

            // note the reverse check should be fixed when this is also implemented for strings
			this['_each'+((reverse && _.isArray(this))?'Right':'')](function(val, i, _this, delta) {
				match = cb.call(opt_ctx, val, i, _this, delta);
				// remove normal or inverted match
				if(match === normal || finish) onmatch.call(target, val, i, _this, delta);
				// if first and the first match is made check if we are done
				if(first && match && !finish) return finish = array? !$value._without(val).length : true, !(normal && finish);
			}, this);

			return target;
		},
        /**
         * Edits an array based on indices
         * @private
         * @method Array#__editKeys
         * @this    {Array|Object}
         * @param   {boolean}            all     - Boolean indicating if we should remove the first occurrence only
         * @param   {boolean}            invert  - Boolean indicating if we should invert the condition
         * @param   {any|Array|Function} $index  - Element to be deleted | Array of element | or a function
         * @param   {Object}             $opt_to_ctx - optional context for the function
         * @returns {Array|Object}                      - new array with the copied elements
         */
        __editKeys: function(invert, onmatch, reverse, target, $index, $opt_to_ctx)
        {
            var type = typeof($index), index;
            var first = !(typeof($opt_to_ctx) === 'number' || type === 'function'), normal = !invert;
            var array, match, finish = false;

            var cb = (type === 'function')?	$index                                               		:
                     (array = _.isArray($index))?   function(i) {return $index._has(i)}                 :
                     ($opt_to_ctx === undefined)?   function(i) {return i === $index}                   :
                                                    function(i) {return i._between($index, $opt_to_ctx)};

            this['_each'+((reverse && _.isArray(this))?'Right':'')](function(val, i, _this, delta) {
                index = _.isArray(this)? (i - delta) : i; // the original index in the array

                match = cb.call($opt_to_ctx, index, _this);
                // remove normal or inverted match
                if(match === normal || finish) onmatch.call(target, i, _this);
                if(first && match && !finish) return finish = array? !$index._without(index).length : true, !(normal && finish);
            }, this);

            return target;
        },
		/**
		 * Finds first element that is picked by the callback function
		 * @private
		 * @this   {Array}
		 * @param  {Function} cb      - callback function to be called for each element
		 * @param  {Object=}  opt_ctx - optional context
		 * @return {any} first value that is found
		 */
		_find: function(cb, opt_ctx) {
			var found;

			this._each(function(elm) {
				if(cb.call(opt_ctx, elm)) return found = elm, false; // break iteration
			});

			return found;
		}
	};

	/**
	 * Object
	 */
	constructWrapper(Object, 'obj', {
		/**
		 * @namespace obj
		 * @memberOf module:_
		 */
		static: {
            // TODO object reduce function
			/**
			 * Clones an object
			 * @public
			 * @static
			 * @method module:_.obj.clone
			 * @param   {Object}  obj   - object to be cloned
			 * @return  {Object}  clone - the cloned object
			 */
			clone: function clone(obj) {
				var clone = Array.isArray(obj)? [] : __obj.create(__obj.getPrototypeOf(obj));

				__obj.getOwnPropertyNames(obj)._each(function(name) {
					__obj.defineProperty(clone, name, __obj.getOwnPropertyDescriptor(obj, name));
				});

				return clone;
			},
            /**
             * Clones an object
             * @public
             * @static
             * @method module:_.obj.cloneDeep
             * @param   {Object}  obj   - object to be cloned
             * @return  {Object}  clone - the cloned object
             */
            cloneDeep: function cloneDeep(obj) {
                var names;

                try       { names = obj._names(); }
                catch (e) { return obj }

                var clone = _.isArray(obj)? [] :__obj.create(obj._proto());
                names._each(function (name) {
                    var pd = __obj.getOwnPropertyDescriptor(obj, name);
                    if (pd.value) pd.value = _.cloneDeep(pd.value);
                    __obj.defineProperty(clone, name, pd);
                });
                return clone;
            },
            /**
             * Extends an object with function/properties from a module object
             * @public
             * @static
             * @method module:_.obj.extend
             * @param   {Object}  obj          - object to be extended
             * @param   {Object=} opt_settings - optional settings/default descriptor
             * @param   {Object}  module       - object containing functions/properties to extend the object with
             * @return  {Object}  obj          - the extended object
             */
            extend: function(obj, opt_settings, module) {
                var settings = module && opt_settings;
                var module   = module || opt_settings;
                var descriptor;
                var config;

                var enumerable   =  settings && settings.enumerable;
                var configurable =  settings && settings.configurable;
                var writable     =  settings && settings.writable;
                var overwrite    = !settings || settings.overwrite !== false; // default is true
                var override     = !settings || settings.override  !== false; // default is true

                var loglevel     = (settings && settings.loglevel) || 'debug';
                if(loglevel === 'debug' && !console.debug) loglevel = 'warn'; // shim for old browsers i.e 10... better solve it with a shim though

                for(var prop in module) // we can't use ._each here otherwise we will execute the getter
                {   if(module.hasOwnProperty(prop))
                    {
                        descriptor = module._descriptor(prop);

                        var overrideProperty    = override;
                        var overwriteProperty   = overwrite;
                        var aliases             = false;
                        var isGetterSetter      = !!(descriptor.get || descriptor.set);

                        // global property overrides
                        if(_.isDefined(enumerable))                                 descriptor.enumerable   = enumerable;
                        if(_.isDefined(configurable))                               descriptor.configurable = configurable;
                        if(_.isDefined(writable) && descriptor._owns('writable'))  descriptor.writable     = writable;

                        // special property specific config
                        // FIXME this doesn't work for getters & setters
                        if(!isGetterSetter && module[prop]._owns('value'))
                        {
                            config = module[prop];
                            descriptor.value = config.value;

                            if(config.clone)                    descriptor.value = _.clone(config.value); // clone deep maybe?
                            if(config.exec)                     descriptor.value = config.value();
                            if(config._owns('enumerable'))     descriptor.enumerable   = config.enumerable;
                            if(config._owns('configurable'))   descriptor.configurable = config.configurable;
                            if(config._owns('writable'))       descriptor.writable     = config.writable;
                            if(config._owns('override'))       overrideProperty  = config.override;
                            if(config._owns('overwrite'))      overwriteProperty = config.overwrite;
                            if(config._owns('shim'))           overwriteProperty = config.shim;
                            if(config.aliases)                  aliases = true;
                        }

                        if(obj._owns(prop))
                        {
                            if(!overwriteProperty) continue; // continue;
                            console[loglevel]('overwriting existing property: '+prop+' while extending: '+_.typeOf(obj));
                        }
                        else if(prop in obj)
                        {
                            if(!overrideProperty) continue; // continue;
                            console[loglevel]('overriding existing property: '+prop+' while extending: '+_.typeOf(obj));
                        }

                        obj._define(prop, descriptor);
                        if(aliases) config.aliases._each(function(alias) {obj._define(alias, descriptor)})
                    }
                }

                return obj;
            },
			/**
			 * Checks is a property is defined
			 * @public
			 * @static
			 * @method module:_.obj.isDefined
			 * @param   {Object} prop - property to check
			 * @returns {boolean}     - indication of the property definition
			 */
			isDefined: function(prop) {
				return prop !== undefined;
			},
			/**
			 * Checks is a property is undefined
			 * @public
			 * @static
			 * @method module:_.obj.isUndefined
			 * @param   {Object} prop - property to check
			 * @returns {boolean}     - indication of the property definition
			 */
			isUndefined: function(prop) {
				return prop === undefined;
			},
			/**
			 * Returns the type of an object. Better suited then the one from js itself
			 * @public
			 * @static
			 * @method module:_.obj.typeof
			 * @param   {Object} obj - object tot check the type from
			 * @returns {string} - type of the object
			 */
			typeOf: function(obj) {
				return __obj.prototype.toString.call(obj)._between('[object ', ']');
			}
		},
		/**
		 * Extension of the native Object class prototype
		 *
		 * @class Object
		 */
		prototype: {
            /**
             * Copies the occurrences from an array to an new object
             * @private
             * @method Object#__cp
             * @this    {Object}
             * @param   {boolean}            all     - Boolean indicating if we should remove the first occurrence only
             * @param   {boolean}            invert  - Boolean indicating if we should invert the condition
             * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | or a function
             * @param   {Object}             opt_ctx - optional context for the function
             * @returns {Object}                     - new array with the copied elements
             */
            __cp: function(all, invert, target, $value, opt_ctx)
            {
                return this.__edit(all, invert, function(val, key, obj) {
                    __obj.defineProperty(this, key, __obj.getOwnPropertyDescriptor(obj, key)); // TODO maybe add a nice function to do stuff like this
                }, false, target, $value, opt_ctx);
            },
            /**
             * Copies the occurrences from an array to an new array
             * @private
             * @method Object#__cpKeys
             * @this    {Object}
             * @param   {boolean}            all     - Boolean indicating if we should remove the first occurrence only
             * @param   {boolean}            invert  - Boolean indicating if we should invert the condition
             * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | or a function
             * @param   {Object}             opt_to_ctx - optional context for the function
             * @returns {Object}                      - new array with the copied elements
             */
            __cpKeys: function(invert, target, $value, opt_to_ctx)
            {
                return this.__editKeys(invert, function(key, _this) {this[key] = _this[key];}, false, target, $value, opt_to_ctx);
            },
            /**
             * Copies a value to an array
             * @public
             * @method Object#_copy
             * @this   {Object}
             * @param  {Array}                 to         - array to copy to
             * @param  {number|Array|Function} $index     - singular index, a from index, an array of indices or a function specifying specific indexes
             * @param  {number=}               opt_to_ctx - to index to delete to | or the context for the function
             * @return {Object}                 this       - mutated array for chaining
             */
            _copy: function(to, $value, opt_ctx)
            {
                return this.__cp(false, false, to, $value, opt_ctx);
            },
            /**
             * Copies all similar values to an array
             * @public
             * @method Object#_copyAll
             * @this   {Object}
             * @param  {Array}                 to         - array to copy to
             * @param  {number|Array|Function} $index     - singular index, a from index, an array of indices or a function specifying specific indexes
             * @param  {number=}               opt_to_ctx - to index to delete to | or the context for the function
             * @return {Object}                 this       - mutated array for chaining
             */
            _copyAll: function(to, $value, opt_ctx)
            {
                return this.__cp(true, false, to, $value, opt_ctx);
            },
            /**
             * Copies keys to an array
             * @public
             * @method Object#_copyKeys
             * @this   {Object}
             * @param  {Array}                 to         - array to copy to
             * @param  {number|Array|Function} $index     - singular index, a from index, an array of indices or a function specifying specific indexes
             * @param  {number=}               opt_to_ctx - to index to delete to | or the context for the function
             * @return {Object}                 this       - mutated array for chaining
             */
            _copyKeys: function(to, $index, opt_to_ctx)
            {
                return this.__cpKeys(false, to, $index, opt_to_ctx);
            },
            /**
             * Copies the occurrences from an array to an new array
             * @private
             * @method Object#__cut
             * @this    {Object}
             * @param   {boolean}            all     - Boolean indicating if we should remove the first occurrence only
             * @param   {boolean}            invert  - Boolean indicating if we should invert the condition
             * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | or a function
             * @param   {Object}             opt_ctx - optional context for the function
             * @returns {Object}                      - new array with the copied elements
             */
            __cut: function(all, invert, target, $value, opt_ctx)
            {
                return this.__edit(all, invert, function(val, key, _this) {this[key] = _this[key]; delete _this[key]}, false, target, $value, opt_ctx);
            },
            /**
             * Copies the occurrences from an array to an new array
             * @private
             * @method Object#__cutKeys
             * @this    {Object}
             * @param   {boolean}            all     - Boolean indicating if we should remove the first occurrence only
             * @param   {boolean}            invert  - Boolean indicating if we should invert the condition
             * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | or a function
             * @param   {Object}             opt_ctx - optional context for the function
             * @returns {Object}                      - new array with the copied elements
             */
            __cutKeys: function(invert, target, $value, opt_ctx)
            {
                return this.__editKeys(invert, function(key, _this) {this[key] = _this[key]; delete _this[key]}, false, target, $value, opt_ctx);
            },
            /**
             * Cut a value to an array
             * @public
             * @method Object#_cut
             * @this   {Object}
             * @param  {Array}                 to         - array to copy to
             * @param  {number|Array|Function} $index     - singular index, a from index, an array of indices or a function specifying specific indexes
             * @param  {number=}               opt_to_ctx - to index to delete to | or the context for the function
             * @return {Object}                 this       - mutated array for chaining
             */
            _cut: function(to, $value, opt_ctx)
            {
                return this.__cut(false, false, to, $value, opt_ctx);
            },
            /**
             * Cut all similar values to an array
             * @public
             * @method Object#_cutAll
             * @this   {Object}
             * @param  {Array}                 to         - array to copy to
             * @param  {number|Array|Function} $index     - singular index, a from index, an array of indices or a function specifying specific indexes
             * @param  {number=}               opt_to_ctx - to index to delete to | or the context for the function
             * @return {Object}                 this       - mutated array for chaining
             */
            _cutAll: function(to, $value, opt_ctx)
            {
                return this.__cut(true, false, to, $value, opt_ctx);
            },
            /**
             * Copies keys to an array
             * @public
             * @method Object#_cutKeys
             * @this   {Object}
             * @param  {Array}                 to         - array to copy to
             * @param  {number|Array|Function} $index     - singular index, a from index, an array of indices or a function specifying specific indexes
             * @param  {number=}               opt_to_ctx - to index to delete to | or the context for the function
             * @return {Object}                 this       - mutated array for chaining
             */
            _cutKeys: function(to, $index, opt_to_ctx)
            {
                return this.__cutKeys(false, to, $index, opt_to_ctx);
            },
            /**
             * Copies keys to an array
             * @public
             * @method Object#_define
             * @this   {Object}
             * @param  {string}       prop - the property name
             * @param  {Object} descriptor - descriptor object
             * @return {Object}       this - object for chaining
             */
            _define: function(prop, descriptor)
            {
                return Object.defineProperty(this, prop, descriptor)
            },
            /**
             * Removes the occurrences from an object
             * @private
             * @method Object#__del
             * @this    {Object}
             * @param   {boolean}            invert  - Boolean indicating if we should invert the condition
             * @param   {any|Array|Function} $index  - Element to be deleted | Array of element | or a function
             * @param   {Object}             opt_to_ctx - optional context for the function
             * @returns {Object}                      - The array without the element
             */
            __del: function(invert, $index, opt_to_ctx)
            {
                return this.__editKeys(invert, function(key) {delete this[key]}, false, this, $index, opt_to_ctx);
            },
            /**
             * Copies keys to an array
             * @public
             * @method Object#_define
             * @this   {Object}
             * @param  {string}       prop - the property name
             * @return {Object} descriptor - descriptor object
             */
            _descriptor: function(prop)
            {
                return Object.getOwnPropertyDescriptor(this, prop)
            },
			/**
			 * Object iterator. If the value false is returned, iteration is canceled. This can be used to stop iteration
			 * @public
			 * @method Object#_each
			 * @this  {Object}
			 * @param {Function} cb      - callback function to be called for each element
			 * @param {Object=}  opt_ctx - optional context
			 */
			_each: function(cb, opt_ctx) {
				// TODO maybe a faster version using keys. I now prefer using for in  because it will not create a new array object with the keys
				for(var key in this)
				{
					if(!this.hasOwnProperty(key)) continue;
					if(cb.call(opt_ctx, this[key], key, this) === false) break;
				}
			},
			/**
			 * Edits the key value pairs of an object
			 * @private
			 * @method Object#__edit
			 * @this    {Array}
			 * @param   {boolean}            all     - Boolean indicating if we should remove the first occurrence only
			 * @param   {boolean}            invert  - Boolean indicating if we should invert the condition
			 * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | or a function
			 * @param   {Object}             opt_ctx - optional context for the function
			 * @returns {Array}                      - new array with the copied elements
			 */
			__edit: __coll.__edit,
            /**
             * Edits an object based on keys
             * @private
             * @method Array#__editKeys
             * @this    {Object}
             * @param   {boolean}            all     - Boolean indicating if we should remove the first occurrence only
             * @param   {boolean}            invert  - Boolean indicating if we should invert the condition
             * @param   {any|Array|Function} $index  - Element to be deleted | Array of element | or a function
             * @param   {Object}             opt_to_ctx - optional context for the function
             * @returns {Object}                      - new array with the copied elements
             */
            __editKeys: __coll.__editKeys,
			/**
			 * Filters
			 * @public
			 * @method Object#_filter
			 * @this   {Object}
			 * @param  {Function} cb      - callback function to be called for each element
			 * @param  {Object=}  opt_ctx - optional context
			 * @return {Array} array containing the filtered values
			 */
			_filter: function(cb, opt_ctx) {
				var filtered = [];

				this._each(function(elm) {
					if(cb.call(opt_ctx, elm)) filtered.push(elm);
				});

				return filtered;
			},
			/**
			 * Finds first element that is picked by the callback function
			 * @public
			 * @method Object#_find
			 * @this   {Object}
			 * @param  {Function} cb      - callback function to be called for each element
			 * @param  {Object=}  opt_ctx - optional context
			 * @return {any} first value that is found
			 */
			_find: __coll._find,
			/**
			 * Returns an array containing the keys of an object (enumerable properties))
			 * @public
			 * @method Object#_keys
			 * @this   {Object}
			 * @return {Array} keys of the object
			 */
			_keys: function() {
				return __obj.keys(this);
			},
            /**
             * Returns the number of own properties on an object
             * @public
             * @method Object#_size
             * @this   {Object}
             * @return {number} the 'length' of the object
             */
            _size: function() {
                var len = 0;

                for(var key in this)
                {
                    if(this.hasOwnProperty(key)) len++;
                }

                return len;
            },
			/**
			 * Returns an array containing the names of an object (includes non-enumerable properties)
			 * @public
			 * @method Object#_names
			 * @return {Array} keys of the object
			 */
			_names: function() {
				return __obj.getOwnPropertyNames(this);
			},
            /**
             * Shortcut for hasOwnProperty
             * @public
             * @method Object#_owns
             * @return {boolean} boolean indicating ownership
             */
            _owns: Object.prototype.hasOwnProperty,
			/**
			 * Returns an array containing the keys & values of an object (enumerable properties)
			 * @public
			 * @method Object#_pairs
			 * @this   {Object}
			 * @return {Array} keys & values of the object in a singular array [key1, val1, key2, val2, ...]]
			 */
			_pairs: function() {
				var pairs = [];

				this._each(function(val, key) {
					pairs.push(key, val);
				});

				return pairs;
			},
			/**
			 * Sets/gets the prototype of an object
			 * NOTE setting a prototype using __proto__ is non standard use at your own risk!
			 * @public
			 * @method Object#_proto
			 * @this   {Object}
			 * @param   {Array}  proto      - the prototype to be set
			 * @returns {Array|Object} this - the prototype of the object or the object itself for chaining
			 */
			_proto: function(proto) {
				if(proto === undefined) return __obj.getPrototypeOf(this);

				this.__proto__ = proto;

				return this;
			},
			// TODO proper implementation
//			/**
//			 * Proxies all functions of an object (including those from the prototype in a certain context.
//			 * @public
//			 * @method Object#_proxy
//			 * @param   {Object} obj - object containing the functions to be proxied
//			 * @param   {Object} ctx - context to proxy the functions in
//			 * @returns {Object} obj - the object containing the proxied versions of the functions
//			 */
//			proxy: function(obj, ctx) {
//				for(var prop in obj)
//				{
//					if(typeof(obj[prop]) === 'function') obj[prop] = obj[prop].bind(ctx);
//				}
//
//				return obj;
//			},
			/**
			 * Removes the occurrences from an object based on value
			 * @public
			 * @method Object#_rm
			 * @this    {Object}
			 * @param   {boolean}            all     - Boolean indicating if we should remove the first occurrence only
			 * @param   {boolean}            invert  - Boolean indicating if we should invert the condition
			 * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | or a function
			 * @param   {Object}             opt_ctx - optional context for the function
			 * @returns {Array}                      - The array without the element
			 */
			__rm: function(all, invert, $value, opt_ctx)
			{
				return this.__edit(all, invert, function(val, key) {delete this[key]}, all, this, $value, opt_ctx);
			},
            /**
             * Better to string version
             * @public
             * @method Object#_toString
             * @this    {Object}
             * @returns {string} - string representation of the object
             */
            _toString: function()
            {
                var output = '';

                for(var key in this)
                {
                    if(this.hasOwnProperty(key))
                    {
                        output += (output? ', ' : '{') + key + ': ' + (this[key]? this[key]._toString() : this[key]);
                    }
                }

                return output + '}';
            },
			/**
			 * Returns an array containing the values of an object (enumerable properties)
			 * @public
			 * @method Object#_values
			 * @this   {Object}
			 * @return {Array} values of the object
			 */
			_values: function() {
				var values = [];

				this._each(function(elm) {
					values.push(elm);
				});

				return values;
			},
			/**
			 * Removes the first occurrence in an object
			 * @public
			 * @method Object#_without
			 * @this    {Object}
			 * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | or a function
			 * @param   {Object}             opt_ctx - optional context or the function
			 * @returns {Array }                     - The array without the element
			 */
			_without: function($value, opt_ctx) {
				return this.__rm(false, false, $value, opt_ctx);
			},
            /**
             * Removes the first occurrence in an array
             * @public
             * @method Array#_$without
             * @this    {Object}
             * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | or a function
             * @param   {Object}             opt_ctx - optional context or the function
             * @returns {Object }                    - NEW object without the element
             */
            _$without: function($value, opt_ctx) {
                return this.__cp(false, true, {}, $value, opt_ctx);
            },
            /**
             * Removes the all occurrence in an array
             * @public
             * @method Array#_withoutAll
             * @this    {Object}
             * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | or a function
             * @param   {Object}             opt_ctx - optional context or the function
             * @returns {Object}                      - The array without the element
             */
            _withoutAll: function($value, opt_ctx) {
                return this.__rm(true, false, $value, opt_ctx);
            },
            /**
             * Removes the all occurrence in an array
             * @public
             * @method Array#_$withoutAll
             * @this    {Object}
             * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | or a function
             * @param   {Object}             opt_ctx - optional context or the function
             * @returns {Object}                      - NEW array without the element
             */
            _$withoutAll: function($value, opt_ctx) {
                return this.__cp(true, true, [], $value, opt_ctx);
            },
            /**
             * Remove elements based on index
             * @public
             * @method Object#_withoutKeys
             * @this   {Object}
             * @param  {number|Array|Function} $index - singular index, a from index, an array of indices or a function specifying specific indexes
             * @param  {number=} opt_to_ctx - to index to delete to | or the context for the function
             * @return {Object}   this   - mutated array for chaining
             */
            _withoutKeys: function($index, opt_to_ctx)
            {
                return this.__del(false, $index, opt_to_ctx);
            },
            /**
             * Remove elements based on index
             * @public
             * @method Object#_$withoutKeys
             * @this   {Object}
             * @param  {number|Array|Function} $index - singular index, a from index, an array of indices or a function specifying specific indexes
             * @param  {number=} opt_to_ctx - to index to delete to | or the context for the function
             * @return {Object}   this   - mutated array for chaining
             */
            _$withoutKeys: function($index, opt_to_ctx)
            {
                return this.__cpKeys(true, [], $index, opt_to_ctx);
            }
		}
	});

	/**
	 * Array
	 */
	constructWrapper(Array, 'arr', {
		/**
		 *
		 * @namespace arr
		 * @memberOf module:_
		 */
//		TODO add proper documentation
// 		/**
//		 * Converter function: converts an object to an array
//		 *
//		 * @param  {Object} obj - object to convert
//		 * @return {Array} the converted object
//		 */
		init: function(obj) {
			var type = _.typeOf(obj);

			switch (type)
			{
				case 'arguments' : return __arr.prototype.slice.call(obj, 0);
				case 'object'    :
				case 'function'  : return __obj.getOwnPropertyNames(obj).map(function(key) { return {prop:key, value:obj[key]}});
				case 'array'     : return obj;
				case 'undefined' :
				case 'null'      : return [];
				default          : return [obj];
			}
		},
		static: {
			/**
			 * Concats 2 or more array. Result is an new array
			 * @public
			 * @static
			 * @method module:_.arr.concat
			 * @param {...Array} var_args     - 2 or more arrays
			 * @returns  {Array} array containing the concatenated array
			 */
			concat: function(var_args) {
				return __arr.prototype.concat.apply([], arguments);
			}
		},
		/**
		 * @class Array
		 */
		prototype: {
			/**
			 * Mutator: Append 1 or more arrays to the current array
			 * @public
			 * @method Array#_append
			 * @this       {Array}
			 * @param      {Array} arr  - array to be appended
			 * @returns    {Array} this - Array appended with arr
			 */
			_append: function(arr) {
				var val;
				var start = this.length;

				for(var i = 0, max = arr.length; i < max; i++)
				{
					if((val = arr[i]) === undefined && !arr.hasOwnProperty(i)) continue; // take in account broken arrays
					this[start+i] = val;
				}

				return this;
			},
			/**
			 * appends 1 or more arrays toa new array
			 * @public
			 * @method Array#_$append
			 * @this       {Array}
			 * @param   {...Array} var_args - 1 or more arrays to be appended
			 * @returns    {Array}  this     - Array appended with arr
			 */
			_$append: function(var_args) {
				// FIXME this need to be adapated for broken arrays I think
				return _.clone(this)._append(var_args);
			},
			/**
			 * Accessor: Returns the average of an array with numbers
			 * @public
			 * @method Array#_avg
			 * @this    {Array<number>}
			 * @returns {Number} - Average of the numbers in the array
			 */
			_avg: function() {
				return this.sum()/this.length;
			},
			/**
			 * Removes al falsey values from an array
			 * @public
			 * @method Array#_compact
			 * @this   {Array}
			 * @return {Array}                 this       - mutated array for chaining
			 */
			_compact: function()
			{
				return this._withoutAll(function(val) {return !val});
			},
			/**
			 * Removes al falsey values from an array into a new array
			 * @public
			 * @method Array#_$compact
			 * @this   {Array}
			 * @return {Array}                 this       - mutated array for chaining
			 */
			_$compact: function()
			{
				return this._$withoutAll(function(val) {return !val});
			},
			/**
			 * Copies a value to an array
			 * @public
			 * @method Array#_copy
			 * @this   {Array}
			 * @param  {Array}                 to         - array to copy to
			 * @param  {number|Array|Function} $index     - singular index, a from index, an array of indices or a function specifying specific indexes
			 * @param  {number=}               opt_to_ctx - to index to delete to | or the context for the function
			 * @return {Array}                 this       - mutated array for chaining
			 */
			_copy: function(to, $value, opt_ctx)
			{
				return this.__cp(false, false, to, $value, opt_ctx);
			},
			/**
			 * Copies all similar values to an array
			 * @public
			 * @method Array#_copyAll
			 * @this   {Array}
			 * @param  {Array}                 to         - array to copy to
			 * @param  {number|Array|Function} $index     - singular index, a from index, an array of indices or a function specifying specific indexes
			 * @param  {number=}               opt_to_ctx - to index to delete to | or the context for the function
			 * @return {Array}                 this       - mutated array for chaining
			 */
			_copyAll: function(to, $value, opt_ctx)
			{
				return this.__cp(true, false, to, $value, opt_ctx);
			},
			/**
			 * Copies keys to an array
			 * @public
			 * @method Array#_copyKeys
			 * @this   {Array}
			 * @param  {Array}                 to         - array to copy to
			 * @param  {number|Array|Function} $index     - singular index, a from index, an array of indices or a function specifying specific indexes
			 * @param  {number=}               opt_to_ctx - to index to delete to | or the context for the function
			 * @return {Array}                 this       - mutated array for chaining
			 */
			_copyKeys: function(to, $index, opt_to_ctx)
			{
				return this.__cpKeys(false, to, $index, opt_to_ctx);
			},
			/**
			 * Copies the occurrences from an array to an new array
			 * @private
			 * @method Array#__cp
			 * @this    {Array}
			 * @param   {boolean}            all     - Boolean indicating if we should remove the first occurrence only
			 * @param   {boolean}            invert  - Boolean indicating if we should invert the condition
			 * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | or a function
			 * @param   {Object}             opt_ctx - optional context for the function
			 * @returns {Array}                      - new array with the copied elements
			 */
			__cp: function(all, invert, target, $value, opt_ctx)
			{
				return this.__edit(all, invert, function(val) {this.push(val);}, false, target, $value, opt_ctx);
			},
			/**
			 * Copies the occurrences from an array to an new array
			 * @private
			 * @method Array#__cut
			 * @this    {Array}
			 * @param   {boolean}            all     - Boolean indicating if we should remove the first occurrence only
			 * @param   {boolean}            invert  - Boolean indicating if we should invert the condition
			 * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | or a function
			 * @param   {Object}             opt_ctx - optional context for the function
			 * @returns {Array}                      - new array with the copied elements
			 */
			__cut: function(all, invert, target, $value, opt_ctx)
			{
				return this.__edit(all, invert, function(val, i, _this) {this.push(val); _this.splice(i, 1)}, false, target, $value, opt_ctx);
			},
			/**
			 * Copies the occurrences from an array to an new array
			 * @private
			 * @method Array#__cutKeys
			 * @this    {Array}
			 * @param   {boolean}            all     - Boolean indicating if we should remove the first occurrence only
			 * @param   {boolean}            invert  - Boolean indicating if we should invert the condition
			 * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | or a function
			 * @param   {Object}             opt_ctx - optional context for the function
			 * @returns {Array}                      - new array with the copied elements
			 */
			__cutKeys: function(invert, target, $value, opt_ctx)
			{
				return this.__editKeys(invert, function(i, _this) {this.push(_this[i]); _this.splice(i, 1)}, false, target, $value, opt_ctx);
			},
			/**
			 * Cut a value to an array
			 * @public
			 * @method Array#_cut
			 * @this   {Array}
			 * @param  {Array}                 to         - array to copy to
			 * @param  {number|Array|Function} $index     - singular index, a from index, an array of indices or a function specifying specific indexes
			 * @param  {number=}               opt_to_ctx - to index to delete to | or the context for the function
			 * @return {Array}                 this       - mutated array for chaining
			 */
			_cut: function(to, $value, opt_ctx)
			{
				return this.__cut(false, false, to, $value, opt_ctx);
			},
			/**
			 * Cut all similar values to an array
			 * @public
			 * @method Array#_cutAll
			 * @this   {Array}
			 * @param  {Array}                 to         - array to copy to
			 * @param  {number|Array|Function} $index     - singular index, a from index, an array of indices or a function specifying specific indexes
			 * @param  {number=}               opt_to_ctx - to index to delete to | or the context for the function
			 * @return {Array}                 this       - mutated array for chaining
			 */
			_cutAll: function(to, $value, opt_ctx)
			{
				return this.__cut(true, false, to, $value, opt_ctx);
			},
			/**
			 * Copies keys to an array
			 * @public
			 * @method Array#_cutKeys
			 * @this   {Array}
			 * @param  {Array}                 to         - array to copy to
			 * @param  {number|Array|Function} $index     - singular index, a from index, an array of indices or a function specifying specific indexes
			 * @param  {number=}               opt_to_ctx - to index to delete to | or the context for the function
			 * @return {Array}                 this       - mutated array for chaining
			 */
			_cutKeys: function(to, $index, opt_to_ctx)
			{
				return this.__cutKeys(false, to, $index, opt_to_ctx);
			},
			/**
			 * Copies the occurrences from an array to an new array
			 * @private
			 * @method Array#__cpKeys
			 * @this    {Array}
			 * @param   {boolean}            all     - Boolean indicating if we should remove the first occurrence only
			 * @param   {boolean}            invert  - Boolean indicating if we should invert the condition
			 * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | or a function
			 * @param   {Object}             opt_to_ctx - optional context for the function
			 * @returns {Array}                      - new array with the copied elements
			 */
			__cpKeys: function(invert, target, $value, opt_to_ctx)
			{
				return this.__editKeys(invert, function(i, _this) {this.push(_this[i]);}, false, target, $value, opt_to_ctx);
			},
			/**
			 * Edits the occurrences of an array
			 * @private
			 * @method Array#__edit
			 * @this    {Array}
			 * @param   {boolean}            all     - Boolean indicating if we should remove the first occurrence only
			 * @param   {boolean}            invert  - Boolean indicating if we should invert the condition
			 * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | or a function
			 * @param   {Object}             opt_ctx - optional context for the function
			 * @returns {Array}                      - new array with the copied elements
			 */
			__edit: __coll.__edit,
			/**
			 * Edits an array based on indices
			 * @private
			 * @method Array#__editKeys
			 * @this    {Array}
			 * @param   {boolean}            all     - Boolean indicating if we should remove the first occurrence only
			 * @param   {boolean}            invert  - Boolean indicating if we should invert the condition
			 * @param   {any|Array|Function} $index  - Element to be deleted | Array of element | or a function
			 * @param   {Object}             opt_to_ctx - optional context for the function
			 * @returns {Array}                      - new array with the copied elements
			 */
			__editKeys: __coll.__editKeys,
			/**
			 * Removes the occurrences from an array
			 * @private
			 * @method Array#__del
			 * @this    {Array}
			 * @param   {boolean}            invert  - Boolean indicating if we should invert the condition
			 * @param   {any|Array|Function} $index  - Element to be deleted | Array of element | or a function
			 * @param   {Object}             opt_to_ctx - optional context for the function
			 * @returns {Array}                      - The array without the element
			 */
			__del: function(invert, $index, opt_to_ctx)
			{
				return this.__editKeys(invert, function(i) {this.splice(i, 1);}, false, this, $index, opt_to_ctx);
			},
			/**
			 * Returns the difference between 2 arrays
			 * @public
			 * @method Array#_diff
			 * @this     {Array}
			 * @param {...Array} var_args - 2 or more arrays to calc the difference from
			 * @returns  {Array}          - this for chaining
			 */
			// TODO this should be an alias
			_diff: function(arr)
			{
				return this._without(arr);
			},
			/**
			 * Returns the difference between 2 arrays in a new array
			 * @public
			 * @method Array#_$diff
			 * @this     {Array}
			 * @param    {Array} arr - array to subtract from this
			 * @returns  {Array}     - new array containing the difference between the first array and the others
			 */
			_$diff: function(arr)
			{
				return this._$selectAll(function(val) {return !arr._has(val)});
			},
			/**
			 * Mutator: Creates a multidimensional array. The dimensions come from the array itself
			 * i.e. [3, 6].$.dimit('zero'); Creates a 2D array of 3 by 6 initialized by the value 'zero'
			 * @public
			 * @this   {Array}
			 * @param  {any|Function=} opt_init - initial value for the array. Can be either a value or a function specifying the value
			 * @param  {Object}        opt_ctx  - optional context for the init function
			 * @return {Array}                  - this for chaining
			 */
			_dimit: function(opt_init, opt_ctx)
			{
				var dimensions = _.clone(this);
				this.length    = dimensions[0];
				var init       = (typeof(opt_init) === 'function')? opt_init : function() {return opt_init};

				// add other dimensions
				addDim(this, 0, dimensions);

				return this;

				function addDim(arr, dim, dimensions)
				{
					for(var i = 0, max = dimensions[dim]; i < max; i++)
					{
						arr[i] = (dim === dimensions.length-1)? init.call(opt_ctx) : new Array(dimensions[dim+1]); // if last dimension set initial value else create a new array
						if(dim === dimensions.length-2 && _.isUndefined(opt_init)) continue; // continue if we are adding the 2nd last dimension and opt_init is undefined
						addDim(arr[i], dim+1, dimensions); // add another dimension
					}
				}
			},
			/**
			 * Mutator: Creates a multidimensional array. The dimensions come from the array itself
			 * i.e. [3, 6]._dimit('zero'); Creates a 2D array of 3 by 6 initialized by the value 'zero'
			 * @public
			 * @method Array#_dimit
			 * @this   {Array}
			 * @param  {any|Function=} opt_init - initial value for the array. Can be either a value or a function specifying the value
			 * @param  {Object}        opt_ctx  - optional context for the init function
			 * @return {Array}                  - this initialized multi-dimensional array
			 */
			_$dimit: function(opt_init, opt_ctx)
			{
				var dimensions = this;
				var arr        = new Array(dimensions[0]);
				var init       = (typeof(opt_init) === 'function')? opt_init : function() {return opt_init};

				// add other dimensions
				addDim(arr, 0, dimensions);

				return arr;

				function addDim(arr, dim, dimensions)
				{
					for(var i = 0, max = dimensions[dim]; i < max; i++)
					{
						arr[i] = (dim === dimensions.length-1)? init.call(opt_ctx) : new Array(dimensions[dim+1]); // if last dimension set initial value else create a new array
						if(dim === dimensions.length-2 && _.isUndefined(opt_init)) continue; // continue if we are adding the 2nd last dimension and opt_init is undefined don't initialize the array
						addDim(arr[i], dim+1, dimensions); // add another dimension
					}
				}
			},
			/**
			 * Array iterator. If the value false is returned, iteration is canceled. This can be used to stop iteration
			 * each is eachlastic in the sense that one can add and delete elements at the current index
			 * @public
			 * @method Array#_each
			 * @this   {Array}
			 * @param  {number=}  opt_step - step for the iteration. In case this is a negative value it will do a reverse iteration
			 * @param  {function} cb       - callback function to be called for each element
			 * @param  {Object=}  opt_ctx  - optional context for the callback function
			 * @return {Array}             - this array for chaining
			 */
			_each: function(opt_step, cb, opt_ctx) {
				if(typeof(opt_step) === 'function')
					return this.__each(1, opt_step, cb);
				else
					return this.__each(opt_step, cb, opt_ctx);
			},
			/**
			 * Array iterator. If the value false is returned, iteration is canceled. This can be used to stop iteration
			 * each is eachlastic in the sense that one can add and delete elements at the current index
			 * @private
			 * @method Array#__each
			 * @this   {Array}
			 * @param  {number=}  step     - step for the iteration. In case this is a negative value it will do a reverse iteration
			 * @param  {function} cb       - callback function to be called for each element
			 * @param  {Object=}  opt_ctx  - optional context for the callback function
			 * @return {boolean}           - the result for the halting condition of the callback function.
			 * 								 false means iteration was broken prematurely.
			 * 								 This information can passed on in nested loops for multi-dimensional arrays
			 */
			__each: function(step, cb, opt_ctx) {
				var from = 0, to = this.length;
				var val, diff, size = to, delta = 0;

				for(var i = from; i < to; i += step)
				{
					if((val = this[i]) === undefined && !this.hasOwnProperty(i)) continue; // handle broken arrays. skip indices, we first check for undefined because hasOwnProperty is slow
					if(cb.call(opt_ctx, this[i], i, this, delta) === false) return false; // return result of the callback function
					if(diff = this.length - size) i += diff, to += diff, size += diff, delta += diff; // correct index after insertion or deletion
				}

				return true;
			},
			/**
			 * Inverse Array iterator. If the value false is returned, iteration is canceled. This can be used to stop iteration
			 * each is eachlastic in the sense that one can add and delete elements at the current index
			 * @public
			 * @method Array#_eachRight
			 * @this  {Array}
			 * @param {number=}  opt_step - step for the iteration. In case this is a negative value it will do a reverse iteration
			 * @param {function} cb       - callback function to be called for each element
			 * @param {Object=}  opt_ctx  - optional context for the callback function
			 * @return {Array}            - this array for chaining
			 */
			_eachRight: function(opt_step, cb, opt_ctx) {
				if(typeof(opt_step) === 'function')
					return this.__eachRight(1, opt_step, cb);
				else
					return this.__eachRight(opt_step, cb, opt_ctx);
			},
			/**
			 * Inverse Array iterator. If the value false is returned, iteration is canceled. This can be used to stop iteration
			 * each is eachlastic in the sense that one can add and delete elements at the current index
			 * @private
			 * @method Array#__eachRight
			 * @this  {Array}
			 * @param {number=}  step     - step for the iteration. In case this is a negative value it will do a reverse iteration
			 * @param {function} cb       - callback function to be called for each element
			 * @param {Object=}  opt_ctx  - optional context for the callback function
			 * @return {Array}            - this array for chaining
			 */
			__eachRight: function(step, cb, opt_ctx) {
				var from = this.length-1, to = -1;
				var val;

				cb = opt_ctx? cb.bind(opt_ctx) : cb;

				for(var i = from; i > to; i -= step)
				{
					if((val = this[i]) === undefined && !this.hasOwnProperty(i)) continue; // handle broken arrays. skip indices, we first check for undefined because hasOwnProperty is slow
					if(cb(this[i], i, this) === false) break;
				}

				return this;
			},
			/**
			 * Finds first element that is picked by the callback function
			 * @public
			 * @method Array#_find
			 * @this   {Array}
			 * @param  {Function} cb      - callback function to be called for each element
			 * @param  {Object=}  opt_ctx - optional context
			 * @return {any} first value that is found
			 */
			_find: __coll._find,
			/**
			 * Finds all elements according to the callback function
			 * @public
			 * @method Array#_findAll
			 * @this   {Array}
			 * @param  {Function} cb      - callback function to be called for each element
			 * @param  {Object=}  opt_ctx - optional context
			 * @return {Array} first value that is found
			 */
			// TODO this should be an alias
			_findAll: function(cb, opt_ctx) {
				return this._$selectAll(cb, opt_ctx);
			},
			/**
			 * Get/sets: the first element of an array
			 * @public
			 * @method Array#_first
			 * @this   {Array}
			 * @param  {any=}      val - value to set on the first element
			 * @return {any|Array}     - first element of the array or the array itself
			 */
			_first: function(val) {
				if(val === undefined) return this[0];

				this[0] = val;

				return this;
			},
			/**
			 * Accessor: Flattens a 2 dimensional array
			 * @public
			 * @method Array#_flatten
			 * @this    {Array}
			 * @returns {Array} - this for chaining
			 */
			_flatten: function() {
				return this._each(function(val, i) {
					if(_.isArray(val)) this.splice.apply(this, val._insert(1)._insert(i));
				}, this)
			},
			/**
			 * Accessor: Flattens a 2 dimensional array
			 * @public
			 * @method Array#_$flatten
			 * @this    {Array}
			 * @returns {Array} - new flattened version of the array
			 */
			_$flatten: function() {
				return this.concat.apply([], this);
			},
			/**
			 * Accessor: Check is an array contains a certain value
			 * @public
			 * @method Array#_has
			 * @this    {Array}
			 * @param   {Object}  elm - element to check membership of
			 * @returns {boolean}     - boolean indicating if the array contains the element
			 */
			_has: function(elm) {
				return this.indexOf(elm) > -1;
			},
			/**
			 * Mutator: Inserts an element in a specific location in an array
			 * @public
			 * @method Array#_insert
			 * @this    {Array}
			 * @param   {Object}  elm - element to check membership of
			 * @param   {number}  i   - position to insert the element
			 * @return  {Array  }     - this for chaining
			 */
			_insert: function(elm, i) {
				return this.splice(i, 0, elm), this;
			},
			/**
			 * Calculates the intersection for 2 or more arrays
			 * NOTE assumes the arrays do not contain duplicate values
			 * @public
			 * @method Array#_intersect
			 * @this   {Array}
			 * @param  {Array} arr - 2 or more arrays
			 * @return {Array}     - this for chaining
			 */
			_intersect: function(arr) {
				return this._selectAll(function(val) {
					return arr._has(val);
				}, this);
			},
			/**
			 * Calculates the intersection for 2 or more arrays
			 * @public
			 * @method Array#_$intersect
			 * @this   {Array}
			 * @param  {Array} arr - 2 or more arrays
			 * @return {Array}     - this for chaining
			 */
			_$intersect: function(arr) {
				return this._$selectAll(function(val) {
					return arr._has(val);
				}, this);
			},
			/**
			 * Checks if an array intersects an other
			 * @public
			 * @method Array#_intersects
			 * @this    {Array}
			 * @param   {Array}  arr - array to check intersection with
			 * @returns {boolean}     - boolean indicating if the 2 arrays intersect
			 */
			_intersects: function(arr) {
				var intersects = false;

				this._each(function(val) {
					if(arr._has(val)) return !(intersects = true);
				});

				return intersects;
			},
			/**
			 * gets/sets the last element of an array
			 * @public
			 * @method Array#_last
			 * @this    {Array}
			 * @param   {any}      val - Value to be set as the last element
			 * @returns {any|Array}    - last element of the array
			 */
			_last: function(val) {
				if(val === undefined) return this[this.length-1];

				this[this.length-1] = val;

				return this;
			},
			/**
			 * Accessor: Returns the maximum value of an array with numbers
			 * @public
			 * @method Array#_max
			 * @this    {Array<number>|Array<any>}
			 * @param   {Function} opt_compare - optional function to determine the the max in case of non-numeric array
			 * @returns {number|any} - maximum number or element in the array
			 */
			_max: function(opt_compare) {
				if(opt_compare === undefined)
				{
					return __math.max.apply(null, this);
				}
				else
				{
					var max = this[0];

					this._each(function(elm) {
						max = opt_compare(elm, max) > 0? elm : max;
					});

					return max;
				}
			},
			/**
			 * Accessor: Returns the minimum value of an array with numbers
			 * @public
			 * @method Array#_min
			 * @this    {Array<number>|Array<any>}
			 * @param   {Function=} opt_compare - optional compare function
			 * @returns {number|any} - minimum element in the array
			 */
			_min: function(opt_compare) {
				if(opt_compare === undefined)
				{
					return __math.min.apply(null, this);
				}
				else
				{
					var min = this[0];

					this._each(function(elm) {
						min = opt_compare(elm, min) < 0? elm : min;
					});

					return min;
				}
			},
			/**
			 * Modifies the members of an array according to a certain function
			 * @public
			 * @method Array#_modify
			 * @this    {Array}
			 * @param   {Function} modifier - function that modifies the array members
			 * @param   {Object=}  opt_ctx  - optional context for the modifier function
			 * @returns {Array}             - the modified array
			 */
			_modify: function(modifier, opt_ctx) {
				this._each(function(val, i) {
					this[i] = modifier.call(opt_ctx, val, i, this);
				}, this);

				return this;
			},
			/**
			 * Copies and modifies the members of an array according to a certain function
			 * @public
			 * @method Array#_$modify
			 * @this    {Array}
			 * @param   {Function} modifier - function that modifies the array members
			 * @param   {Object=}  opt_ctx  - optional context for the modifier function
			 * @returns {Array}             - the modified array
			 */
			_$modify: function(modifier, opt_ctx)
			{
				return _.clone(this)._modify(modifier, opt_ctx);
			},
			/**
			 * Chainable version of push
			 * @public
			 * @method Array#_push
			 * @this   {Array}
			 * @param  {...any} var_args - one or more elements to add to an array
			 * @return {Array}  this     - this for chaining
			 */
			_push: function(var_args) {
				this.push.apply(this, arguments);

				return this;
			},
			/**
			 * Accessor: Returns a random element from the array
			 * @public
			 * @method Array#_random
			 * @this   {Array}
			 * @return {any} - random element from the array
			 */
			_random: function() {
				return this[_.int.random(0, this.length - 1)];
			},
			/**
			 * Removes the occurrences from an array
			 * @private
			 * @method Array#__rm
			 * @this    {Array}
			 * @param   {boolean}            all     - Boolean indicating if we should remove the first occurrence only
			 * @param   {boolean}            invert  - Boolean indicating if we should invert the condition
			 * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | or a function
			 * @param   {Object}             opt_ctx - optional context for the function
			 * @returns {Array}                      - The array without the element
			 */
			__rm: function(all, invert, $value, opt_ctx)
			{
				return this.__edit(all, invert, function(val, i) {this.splice(i, 1);}, false, this, $value, opt_ctx);
			},
			/**
			 * Select the first occurrence in an array
			 * @public
			 * @method Array#_select
			 * @this    {Array}
			 * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | or a function
			 * @param   {Object}             opt_ctx - optional context or the function
			 * @returns {Array }                     - array with the selected element
			 */
			_select: function($value, opt_ctx) {
				return this.__rm(false, true, $value, opt_ctx);
			},
			/**
			 * Accessor: Returns the first element found by the selector function
			 * @public
			 * @method Array#_$select
			 * @this    {Array}
			 * @param   {Function} $value   - selector function callback to be called on each element
			 * @param   {Object=}  opt_ctx  - optional context for the callback function
			 * @returns {any}               - the found element or undefined otherwise
			 */
			_$select: function($value, opt_ctx) {
				return this.__cp(false, false, [], $value, opt_ctx);
			},
			/**
			 * Select all occurrence in an array
			 * @public
			 * @method Array#_selectAll
			 * @this    {Array}
			 * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | or a function
			 * @param   {Object}             opt_ctx - optional context or the function
			 * @returns {Array}                      - array with the selected elements
			 */
			_selectAll: function($value, opt_ctx) {
				return this.__rm(true, true, $value, opt_ctx);
			},
			/**
			 * Select all occurrence in an array and copies them to a new array
			 * @public
			 * @method Array#_$selectAll
			 * @this    {Array}
			 * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | or a function
			 * @param   {Object}             opt_ctx - optional context or the function
			 * @returns {Array}                      - array with the selected elements
			 */
			_$selectAll: function($value, opt_ctx) {
				return this.__cp(true, false, [], $value, opt_ctx);
			},
			/**
			 * Selects elements based on index, removes others
			 * @public
			 * @method Array#_selectKeys
			 * @this   {Array}
			 * @param  {number|Array|Function} $index - singular index, a from index, an array of indices or a function specifying specific indexes
			 * @param  {number=} opt_to_ctx - to index to delete to | or the context for the function
			 * @return {Array}   this   - mutated array for chaining
			 */
			_selectKeys: function($index, opt_to_ctx)
			{
				return this.__del(true, $index, opt_to_ctx);
			},
			/**
			 * Selects elements based on index into a new array
			 * @public
			 * @method Array#_$selectKeys
			 * @this   {Array}
			 * @param  {number|Array|Function} $index - singular index, a from index, an array of indices or a function specifying specific indexes
			 * @param  {number=} opt_to_ctx - to index to delete to | or the context for the function
			 * @return {Array}   this   - mutated array for chaining
			 */
			_$selectKeys: function($index, opt_to_ctx)
			{
				return this.__cpKeys(false, [], $index, opt_to_ctx);
			},
			/**
			 * Retrieves and sets the size of an array
			 * @public
			 * @method Array#_size
			 * @this    {Array}
			 * @param   {number} size  - the new size of the array
			 * @returns {number|Array} - the length of the arrayu or the array itself
			 */
			_size: function(size) {
				if(size === undefined) return this.length;

				this.length = size;

				return this;
			},
			/**
			 * Accessor: Returns the sum of all numbers in a number array
			 * @public
			 * @method Array#_sum
			 * @this    {Array<number>}
			 * @returns {number} - sum of the  number array
			 */
			_sum: function() {
				return this.reduce(function(a, b) { return a + b; });
			},
            /**
             * Better to string version
             * @public
             * @method Array#_toString
             * @this    {Array}
             * @returns {string} - string representation of the array
             */
            _toString: function()
            {
                var output = '[';

                for(var i = 0, max = this.length; i < max; i++)
                {
                    output += (i? ', ' : '') + this[i]._toString();
                }

                return output + ']';
            },
			/**
			 * Calculates the union for 2 arrays
			 * @public
			 * @method Array#_unify
			 * @this   {Array}
			 * @param  {Array} arr  - array to unfiy
			 * @return {Array} this - unified with the other
			 */
			_unify: function(arr) {
				return this._append(arr)._unique();
			},
			/**
			 * Calculates the union for 2 arrays into an new array
			 * @public
			 * @method Array#_$unify
			 * @this   {Array}
			 * @param  {Array} arr  - array to unfiy
			 * @return {Array}      - new array containing the unification
			 */
			_$unify: function(arr) {
				var app = this._$append(arr);
				var output = app._unique();

				return output;

//				return this._$append(arr)._unique();
			},
			/**
			 * Removes duplicate values in an array
			 * @public
			 * @method Array#_unique
			 * @this    {Array}
			 * @returns {Array} - new array without duplicates
			 */
			_unique: function() {
				this._eachRight(function(val, i) {
					this._each(function(duplicate, j) {
						if(val === duplicate && j < i) return this.splice(i, 1), false;
						return j < i;
					}, this)
				}, this);

				return this;
			},
			/**
			 * Accessor: Returns a new version of the array without duplicates
			 * @public
			 * @method Array#_$unique
			 * @this    {Array}
			 * @returns {Array} - new array without duplicates
			 */
			_$unique: function() {
				var unique = [];

				this._each(function(val) {
					if(!unique._has(val)) unique.push(val);
				}, this);

				return unique;
			},
			/**
			 * Removes the first occurrence in an array
			 * @public
			 * @method Array#_without
			 * @this    {Array}
			 * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | or a function
			 * @param   {Object}             opt_ctx - optional context or the function
			 * @returns {Array }                     - The array without the element
			 */
			_without: function($value, opt_ctx) {
				return this.__rm(false, false, $value, opt_ctx);
			},
			/**
			 * Removes the first occurrence in an array
			 * @public
			 * @method Array#_$without
			 * @this    {Array}
			 * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | or a function
			 * @param   {Object}             opt_ctx - optional context or the function
			 * @returns {Array }                     - NEW array without the element
			 */
			_$without: function($value, opt_ctx) {
				return this.__cp(false, true, [], $value, opt_ctx);
			},
			/**
			 * Removes the all occurrence in an array
			 * @public
			 * @method Array#_withoutAll
			 * @this    {Array}
			 * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | or a function
			 * @param   {Object}             opt_ctx - optional context or the function
			 * @returns {Array}                      - The array without the element
			 */
			_withoutAll: function($value, opt_ctx) {
				return this.__rm(true, false, $value, opt_ctx);
			},
			/**
			 * Removes the all occurrence in an array
			 * @public
			 * @method Array#_$withoutAll
			 * @this    {Array}
			 * @param   {any|Array|Function} $value  - Element to be deleted | Array of element | or a function
			 * @param   {Object}             opt_ctx - optional context or the function
			 * @returns {Array}                      - NEW array without the element
			 */
			_$withoutAll: function($value, opt_ctx) {
				return this.__cp(true, true, [], $value, opt_ctx);
			},
			/**
			 * Remove elements based on index
			 * @public
			 * @method Array#_withoutKeys
			 * @this   {Array}
			 * @param  {number|Array|Function} $index - singular index, a from index, an array of indices or a function specifying specific indexes
			 * @param  {number=} opt_to_ctx - to index to delete to | or the context for the function
			 * @return {Array}   this   - mutated array for chaining
			 */
			_withoutKeys: function($index, opt_to_ctx)
			{
				return this.__del(false, $index, opt_to_ctx);
			},
			/**
			 * Remove elements based on index
			 * @public
			 * @method Array#_$withoutKeys
			 * @this   {Array}
			 * @param  {number|Array|Function} $index - singular index, a from index, an array of indices or a function specifying specific indexes
			 * @param  {number=} opt_to_ctx - to index to delete to | or the context for the function
			 * @return {Array}   this   - mutated array for chaining
			 */
			_$withoutKeys: function($index, opt_to_ctx)
			{
				return this.__cpKeys(true, [], $index, opt_to_ctx);
			}
		}
	});

	/**
	* String
	*/
	constructWrapper(String, 'str', {
		/**
		 * @namespace str
		 * @memberOf module:_
		 */
		/**
		 * @class String
		 */
        static: {
            /**
             * String check
             * @public
             * @method String.isString
             * @param   {string} str - string to check
             * @returns {string}     - boolean indicating if it is a string
             */
            isString: function(str) {
                return typeof(str) === 'string';
            }
        },
		prototype: {
			/**
			 * Returns the rest of the string after a certain substring (1st occurrence)
			 * @public
			 * @method String#_after
			 * @param   {string} substr - substring to identify the return string
			 * @returns {string}        - new string containing the string after the given substring
			 */
			_after: function(substr) {
				var index = this.indexOf(substr);
				return (index > -1)? this.slice(index + substr.length) : this;
			},
			/**
			 * Returns the rest of the string after a certain substring (last occurrence)
			 * @public
			 * @method String#_afterLast
			 * @param   {string} substr - substring to identify the return string
			 * @returns {string}         - new string containing the string after the given substring
			 */
			_afterLast: function(substr) {
				var index = this.lastIndexOf(substr);
				return (index > -1)? this.slice(index + substr.length) : this;
			},
			/**
			 * Returns the rest of the string before a certain substring (1st occurrence)
			 * @public
			 * @method String#_before
			 * @param   {string} substr - substring to identify the return string
			 * @returns {string}         - new string containing the string before the given substring
			 */
			_before: function(substr) {
				var index = this.indexOf(substr);
				return (index > -1)? this.slice(0, index) : this;
			},
			/**
			 * Returns the rest of the string before a certain substring (last occurrence)
			 * @public
			 * @method String#_beforeLast
			 * @param   {string} substr - substring to identify the return string
			 * @returns {string}         - new string containing the string before the given substring
			 */
			_beforeLast: function(substr) {
				var index = this.lastIndexOf(substr);
				return (index > -1)? this.slice(0, index) : this;
			},
			/**
			 * Returns the string between a prefix && post substring
			 * @public
			 * @method String#_between
			 * @param   {string} pre_substr  - substring to identify the return string
			 * @param   {string} post_substr - substring to identify the return string
			 * @returns {string}             - new string containing the string before the given substring
			 */
			_between: function(pre_substr, post_substr) {
				return this._after(pre_substr)._before(post_substr);
			},
			/**
			 * Capitalize the first character of a string
			 * @public
			 * @method String#_capitalize
			 * @returns {string} - the capitalized string
			 */
			_capitalize: function() {
				return this[0]? this[0].toUpperCase() + this.slice(1): this;
			},
			/**
			 * Decapitalize the first character of a string
			 * @public
			 * @method String#_decapitalize
			 * @returns {string} - the decapitalized string
			 */
			_decapitalize: function() {
				return this[0]? this[0].toLowerCase() + this.slice(1): this;
			},
			/**
			 * Checks if the string ends with a certain substr
			 * @public
			 * @method String#_endsWith
			 * @param   {string}  substr - substring to check for
			 * @returns {boolean}        - boolean indicating if the string ends with the given substring
			 */
			_endsWith: function(substr) {
				return this.slice(-substr.length) === substr;
			},
			/**
			 * Checks if the string contains a certain substring
			 * @public
			 * @method String#_has
			 * @param   {string}  substr - substring to check for
			 * @returns {boolean}        - boolean indicating if the string contains the substring
			 */
			 _has: function(substr) {
				 return this.indexOf(substr) > -1;
			 },
			/**
			 * Inserts a substring in a string
			 * @public
			 * @method String#_insert
			 * @param   {string}  substr - substring to insert
			 * @param   {number}  i      - index to insert the substring (can be a negative value as well)
			 * @returns {string}         - new string with the substring inserted
			 */
			_insert: function(substr, i) {
				return this._splice(i, 0, substr);
			},
			/**
			 * Checks if a string is all lowercase
			 * @public
			 * @method String#_isLowerCase
			 * @returns {boolean} - Boolean indicating if the string is lowercase
			 */
			_isLowerCase: function() {
				return this == this.toLowerCase();
			},
			/**
			 * Checks if a string is all uppercase
			 * @public
			 * @method String#_isUpperCase
			 * @returns {boolean} - Boolean indicating if the string is uppercase
			 */
			_isUpperCase: function() {
				return this == this.toUpperCase();
			},
			/**
			 * getter: the last character of a string
			 * @public
			 * @method String#_last
			 * @returns {string} - the last character of the string
			 */
			get _last() {
				return this[this.length-1];
			},
			/**
			 * Splice for string. NOTE string are immutable so this function will return a NEW string
			 * @public
			 * @method String#_splice
			 * @param   {number}  i       - index to start (can be a negative value as well)
			 * @param   {string}  howMany - number of characters to apply
			 * @param   {string}  substr  - substring to insert
			 * @returns {string}          - NEW string with deleted or inserted characters
			 */
			_splice: function(i, howMany, substr) {
				return this.slice(0,i) + substr + this.slice(i + __math.abs(howMany));
			},
			/**
			 * Checks if the string starts with a certain substr
			 * @public
			 * @method String#_startsWith
			 * @param   {string}  substr - substring to check for
			 * @returns {boolean}        - boolean indicating if the string starts with the given substring
			 */
			_startsWith: function(substr) {
				return this.indexOf(substr) === 0;
			},
            /**
             * Better to string version
             * @public
             * @method String#_toString
             * @this    {string}
             * @returns {string} - string representation of the object
             */
            _toString: String.prototype.toString
		}
	});

	/**
	 * Math
	 */
	constructWrapper(Math, 'math', {
		/**
		 * @namespace math
		 * @memberOf module:_
		 */
		static: {
			/**
			 * Return true based on a certain probability based on a number between 0 & 1;
			 * @public
			 * @method module:_.math.byProb
			 * @param   {number}  p - probability to return true
			 * @returns {boolean}   - true or false based on the probability
			 */
			byProb: function(p) {
				return __math.random() < p;
			},
			/**
			 * Return the distance between 2 points in Euclidean space
			 * @public
			 * @method module:_.math.distance
			 * @param   {number}  x1 - x position for point1
			 * @param   {number}  y1 - y position for point1
			 * @param   {number}  x2 - x position for point2
			 * @param   {number}  y2 - y position for point2
			 * @returns {number} - distance between the 2 points
			 */
			distance: function(x1, y1, x2, y2) {
				return __math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
			},
			/**
			 * Return the squared distance between 2 points in Euclidean space
			 * @public
			 * @method module:_.math.distanceSquared
			 * @param   {number}  x1 - x position for point1
			 * @param   {number}  y1 - y position for point1
			 * @param   {number}  x2 - x position for point2
			 * @param   {number}  y2 - y position for point2
			 * @returns {number} - squared distance between the 2 points
			 */
			distanceSquared: function(x1, y1, x2, y2) {
				return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
			},
			/**
			 * Calculates the angle between a the y-axis and a line through a point x, y calculated clockwise (slope)
			 * @public
			 * @method module:_.math.angle
			 * @param   {number}  x -
			 * @param   {number}  y -
			 * @returns {number} - angle in degrees
			 */
			angle: function(x, y) {
				return (_.rad2Deg(Math.atan2(x, -y))+360)%360;
			},
			/**
			 * Calculates the angle between a the x-axis and a line through a point x, y calculated counter-clockwise (slope)
			 * @public
			 * @method module:_.math.angle
			 * @param   {number}  x -
			 * @param   {number}  y -
			 * @returns {number} - angle in degrees
			 */
			angleSloped: function(x, y) {
				return (90-_.rad2Deg(Math.atan2(x, -y))+360)%360;
			},
			/**
			 * Calculates the angle between a the x-axis and a line through a point x, y calculated counter-clockwise (slope)
			 * @public
			 * @method module:_.math.angle
			 * @param   {number}  angle - angle in degrees
			 * @returns {number} - angle in degrees
			 */
			angleInvert: function(angle) {
				return (angle+540)%360;
			},
			/**
			 * Convert degrees to radians.
			 *
			 * @method module:_.math.deg2Rad
			 * @param {number} degrees
			 * @returns {number} radians
			 */
			deg2Rad: function() {
				var degreeToRadiansFactor = Math.PI/180;

				return function (degrees) {
					return degrees*degreeToRadiansFactor;
				};
			}(),
			/**
			 * Decimal log function
			 * @public
			 * @method module:_.math.log10
			 * @param   {number} val - value to get the log10 from
			 * @returns {number}     - angle in degrees
			 */
			log10: function(val) {
				return _.log(val)/_.LN10;
			},
			/**
			 * Convert radians to degrees
			 *
			 * @method module:_.math.rad2Deg
			 * @param {number} radians
			 * @returns {number} degrees
			 */
			rad2Deg: function() {
				var radianToDegreesFactor = 180/Math.PI;

				return function (radians) {
					return radians*radianToDegreesFactor;
				};
			}(),
			/**
			 * Significantly faster version of Math.max if there are more then 2+x elements
			 * See http://jsperf.com/math-s-min-max-vs-homemade/5
			 * Borrowed from phaser
			 *
			 * @method module:_.math.maxmore
			 * @return {number} The highest value from those given.
			 */
			maxmore: function ()
			{
				for (var i = 1, max = 0, len = arguments.length; i < len; i++)
				{
					if (arguments[max] < arguments[i])
					{
						max = i;
					}
				}

				return arguments[max];
			},

			/**
			 * Significantly faster version of Math.min if there are more then 2+x elements
			 * See http://jsperf.com/math-s-min-max-vs-homemade/5
			 * Borrowed from phaser
			 *
			 * @method module:_.math.minmore
			 * @return {number} The lowest value from those given.
			 */
			minmore: function () {

				for (var i = 1 , min = 0, len = arguments.length; i < len; i++)
				{
					if (arguments[i] < arguments[min])
					{
						min = i;
					}
				}

				return arguments[min];
			}
		}
	});

	/**
	  * Number
	  */
	constructWrapper(Number, 'num', {
		/**
		 * @namespace num
		 * @memberOf module:_
		 */
		static: {
            /**
             * Checks if an object is a number
             * @public
             * @method module:_.num.isNumber
             * @param   {any} num - object to check the number for
             * @returns {boolean} - indicating if it is a number
             */
            isNumber: function(num) {
                return typeof(num) === 'number' && !isNaN(num); // use the broken isNaN here because iOS doesn't support Number.isNaN
            },
			/**
			 * Returns a random integer between the min and max value, or between 0 & 1) if no arguments are given
			 * @public
			 * @method module:_.num.random
			 * @param   {number=} opt_min - integer lower bound
			 * @param   {number=} opt_max - integer upper bound
			 * @returns {number} - random number in between
			 */
			random: function(opt_min, opt_max) {
				var min = opt_min || 0;
				var max = opt_max || 1;

				return _.isDefined(opt_max)? __math.random() * (max - min) + min : __math.random();
			},
			// TODO left inclusive right inclusive or both
			/**
			 * Rebounds a number between 2 values. Handy for number ranges that are continuous
			 * Curried version: for example - __num.rebound(4.6)(-5.8, 7.98)
			 * @public
			 * @method module:_.num.rebound
			 * @param   {number}   num - number value
			 * @returns {function}     - function to add the range
			 */
			rebound: function(num) { // TODO (negative) testcases
				/**
				 * Rebounds a number between 2 values. For continuous number ranges
				 * @public
				 * @param   {number}  min - minimum value
				 * @param   {number}  max - maximum value
				 * @returns {boolean} - rebounded version of the number that falls between the 2 values
				 */
				return function range(min, max)
				{
					return min + num % (max - min);
				}
			}
		},
		/**
		 * @class Number
		 */
		prototype: {
			/**
			 * Getter: returns the sign of a number
			 * @public
			 * @method Number#_get
			 * @returns {number} - sign of the number: -1, 0, 1
			 */
			get _sign() {
				return this > 0?  1 :
					   this < 0? -1 :
								  0 ;
			},
			/**
			 * Getter: indicator if the the number is even
			 * @public
			 * @method Number#_even
			 * @returns {boolean} - indicating if the number is even
			 */
			get _even() {
				return !(this & 1);
			},
			/**
			 * Getter: indicator if the the number is odd
			 * @public
			 * @method Number#_odd
			 * @returns {boolean} - indicating if the number is odd
			 */
			get _odd() {
				return !!(this & 1);
			},
			/**
			 * Getter: parity for a number 0: even and 1: for odd
			 * @public
			 * @method Number#_parity
			 * @returns {number} - parity of the number
			 */
			get _parity() {
				return this & 1;
			},
			/**
			 * Power of a number
			 * @public
			 * @method Number#_pow
			 * @param   {number}  exponent - the exponent
			 * @returns {number}           - the powered number
			 */
			_pow: function(exponent) {
				return _.pow(this, exponent)
			},
			/**
			 * Checks if a number is between to values
			 * @public
			 * @method Number#_between
			 * @param   {number}  min - minimum value
			 * @param   {number}  max - maximum value
			 * @returns {boolean}     - boolean indicating if the value lies between the two values
			 */
			_between: function(min, max) {
				return min <= this && this <= max; // this is correct when saying between the endpoints should be included when saying from to the end point "to" is excluded well for mathematicians that is
			},
			/**
			 * Bounds a number between 2 values
			 * @public
			 * @method Number#_bound
			 * @param   {number}  min - minimum value
			 * @param   {number}  max - maximum value
			 * @returns {boolean}     - bounded version of the number that falls between the 2 values
			 */
			_bound: function(min, max) {
				return _.min(_.max(this, min), max);
			},
			/**
			 * Rebounds a number between 2 values. Handy for number ranges that are continuous
			 * Curried version: for example - __num.rebound(4.6)(-5.8, 7.98)
			 * @public
			 * @method Number#_rebound
			 * @param   {number}   num - number value
			 * @returns {function}     - function to add the range
			 */
			_rebound: function(min, max)
			{
				return min + this % (max - min);
			},
            /**
             * Better to string version
             * @public
             * @method Number#_toString
             * @this    {Number}
             * @returns {string} - string representation of the number
             */
            _toString: function()
            {
                return this+'';
            }
		}
	});

	// FIXME textcases and complete adaptation to static methods
	constructWrapper(Function, 'fnc', {
		/**
		 * @namespace fnc
		 * @memberOf module:_
		 */
		static: {
			/**
			 * Delays a function by a given number of milliseconds
			 * Use bind to prefill args and set context: fnc.bind(this, 'arg1', 'arg2').callAfter(10);
			 * @public
			 * @method module:_.fnc.callAfter
			 * @param {number} delay   - the delay for the call in milliseconds
			 * @param {number} cb      - callback function to call after the delay
			 * @param {number} opt_ctx - optional arguments
			 */
			callAfter: function (delay, cb, opt_ctx) {
				setTimeout(function() {
					cb.call(opt_ctx)
				}, delay);
			},
            /**
             * Defers some methods so they'll get set to the end of the stack
             * @public
             * @method module:_.fnc.defer
             * @param {number} cb      - callback function to call after the delay
             * @param {number} opt_ctx - optional context
             */
            defer: function (cb, opt_ctx) {
                setTimeout(function() {
                    cb.call(opt_ctx)
                }, 0);
            },
			/**
			 * Memoization function
			 * @public
			 * @method module:_.fnc.memoize
			 * @param {number}   delay   - optional arguments
			 */
			memoize: function(ctx)
			{
				// TODO
			},
			/**
			 * Creates a partial version of the function that can be partially prefilled/bootstrapped with arguments use undefined to leave blank
			 * @public
			 * @method module:_.fnc.partial
			 * @param   {...any}   var_args - arguments to prefill/bootstrap. Use undefined to identify custom input
			 * @returns {function}          - partial version of the function
			 */
			 partial: function (var_args, fnc) {
				var args = arguments; // is to array needed??

				return function() {
					for(var i = 0, arg = 0; i < args.length && arg < arguments.length; i++)
					{
						if(args[i] === undefined)
						{
							args[i] = arguments[arg++];
						}
					}
					return fnc.apply(this. args);
				}
			 },
			/**
			 * Similar to bind but only prefills the arguments not the context
			 * @public
			 * @method module:_.fnc.strap
			 * @param   {...any}   var_args - arguments to prefill
			 * @param   {Function} fnc      - function to strap
			 * @returns {Function}          - bootstrapped version of the function
			 */
			// TODO add partial support
			strap: function(var_args, fnc) {
				var args = _.arr(arguments); // convert to array

				fnc = args.pop();

				return fnc.bind.apply(fnc, [null]._append(args));
			},
			/**
			 * Similar to bind but only prefills the arguments not the context
			 * @public
			 * @method module:_.fnc.bind
			 * @param   {...any}   var_args - arguments to prefill
			 * @param   {Function} fnc      - function to strap
			 * @returns {Function}          - bootstrapped version of the function
			 */
			// TODO add partial support
			bind: function(ctx, var_args, fnc) {
				var args = _.arr(arguments); // convert to array

				fnc = args.pop();

				return fnc.bind.apply(fnc, args)
			},
			/**
			 * Super simple inheritance function
			 * @public
			 * @method module:_.fnc.inherit
			 * @param   {Function} child  - child
			 * @param   {Function} parent - parent to inherit from
			 */
			inherit: function(child, parent) {
				child.prototype = Object.create(parent.prototype);
				child.prototype.constructor = child;
				child._super = parent.prototype;
			},
			/**
			 * Mixin properties on a class. It is assumed this function is called inside the constructor
			 * @public
             * @method module:_.fnc.mixin
			 * @param {Function}        child - child
			 * @param {Function|Array} mixins - array or sinlge mixin classes
			 */
			mixin: function(child, mixins) {

                child._mixin = function(mixin) {
                    return mixin.prototype;
                };

				mixins._each(function(mixin) {
                    // copy static fucntions
                    _.extend(child, mixin);
					// copy prototype functions
					_.extend(child.prototype, mixin.prototype);
				});
			}
		},
        prototype:
        {
            /**
             * Better to string version
             * @public
             * @method Function#_toString
             * @this    {Function}
             * @returns {string} - string representation of the object
             */
            _toString: function()
            {
                return this.toString();
            },
            /**
             * Returns the name of a function if it is an unamed function it returns an empty string ''
             * NOTE avoid using this function as on older browsers name property is not defined and is shimmed
             * @public
             * @method Function#_name
             * @this    {Function}
             * @returns {string} - the name of the function
             */
            // FIXME a better solution is to shim the name property in case it is not defined. In that case we we can use a simpler function
            get _name()
            {
                if(_.isDefined(Function.prototype.name)) return this.name;
                else return this.toString().match(/^function\s?([^\s(]*)/)[1];
            }
        }
	});

	/**
	 * Physics
	 */
	constructWrapper(null, 'physics', {
		/**
		 * @namespace physics
		 * @memberOf module:_
		 */
		// FIXME These function should be properties of a proper physics class
		static: {
			/**
			 * Calculates the factor of a displacement vector and a speed scalar
			 * @public
			 * @method module:_.physics.speed2velocity
			 * @param   {number} dx    - displacement/direction x
			 * @param   {number} dy    - displacement/direction y
			 * @param   {number} speed - speed to be componized
			 * @return  {Object}       - object containing velocity for x & y coordinates
			 */
			speed2velocity: function(dx, dy, speed) {
				var speedFactor = speed/_.sqrt(dx*dx + dy*dy);

				return {
					x: speedFactor*dx,
					y: speedFactor*dy
				}
			},
			/**
			 * Calculates the speed based on the velocity (actually this is just the Hypotenuse of a triangle)
			 * @public
			 * @method module:_.physics.speed2velocity
			 * @param   {number} vx - velocity x
			 * @param   {number} vy - velocity y
			 * @return  {number}    - the speed of the physical body
			 */
			velocity2speed: function(vx, vy) {
				return _.sqrt(vx*vx + vy*vy)
			}
		}
	});

	/**
	  * Integer
	  * // TODO check if we can do something with signed arrays
	  */
	constructWrapper(null, 'int', {
		/*
		 * Converter function
		 */
		init: function(num) {
			return num|0;
		},
		/**
		 * @namespace int
		 * @memberOf module:_
		 */
		static: {
			/**
			 * Returns the length of an integer
			 * @public
			 * @method module:_.int.length
			 * @param   {number} int - integer to measure the length
			 * @returns {number} - length of the integer
			 */
			len: function(int) {
				return int? 1+_.log10(int)|0 : 1;
//				return (int+'').length;
			},
			/**
			 * Returns the length of an integer
			 * @public
			 * @method module:_.int.length
			 * @param   {number} int    - integer to measure the length
			 * @param   {number} length - total length of the string including leading zero's
			 * @returns {string} - string with leading zero's
			 */
			leadZeros: function(int, length) {
				return (int/_.pow(10, length)).toFixed(length).substr(2);
			},
			/**
			 * Returns a random integer between the min and max value
			 * @public
			 * @method module:_.int.random
			 * @param   {number} min - integer lower bound
			 * @param   {number} max - integer upper bound
			 * @returns {number} - random integer in between
			 */
			random: function(min, max) {
				return min + (__math.random() * (max + 1 - min))|0;
			},
			/**
			 * Rebounds a number between 2 values. Handy for arrays that are continuous
			 * Curried version: for example - __int.rebound(4)(-5, 7)
			 * @public
			 * @method module:_.int.rebound
			 * @param   {number}  int - integer value
			 * @returns {function} - function to add the range
			 */
			rebound: function(int) {
				/**
				 * Rebounds a number between 2 values. Handy for arrays that are continuous
				 * @private
				 * @param   {number}  min - minimum value
				 * @param   {number}  max - maximum value
				 * @returns {boolean} - rebounded version of the number that falls between the 2 values
				 */
				return function range(min, max) {
					var overflow = int % (__math.abs(max - min) + 1);

					return ((overflow < 0)? max+1 : min) + overflow;
				}
			}
		}
	});

	return _
})