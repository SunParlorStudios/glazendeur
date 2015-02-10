/**
 * Manages JSON files
 *
 * @public
 * @singleton module:JSON
 * @extends JSON
 */
_.extend(JSON, {
	/**
	 * The cache the JSON manager uses to save its jsons
	 *
	 * @private
	 * @property module:JSON#property
	 */
	_cache: {},

	/**
	 * Adds a parsed JSON file to the cache
	 * 
	 * @public
	 * @method module:JSON#load
	 * @param {string} path - The path the JSON is stored at, and is also the key under which this JSON is stored
	 * @param {bool=false} reloading - Boolean that specifies if the file is reloading, if it is not reloading, it is added to the content watch
	 */
	load: function (path, reloading)
	{
		this._cache[key] = JSON.parse(IO.open(path));

		if (!reloading)
		{
			ContentManager.watch(path);
			Log.JSON("Added " + path + " to the file watch");
			Log.JSON("Parsed JSON from " + path + " stored in '" + key + "'");
		}
	},

	/**
	 * Retrieves a parsed JSON file from the cache, and if not found, tries to load it
	 *
	 * @public
	 * @method module:JSON#get
	 * @param {string} path - The path to be retrieved
	 */
	get: function (path)
	{
		if (this._cache[path] === undefined)
		{
			this.load(path, false);
			Log.warning("Warning - trying to retrieve a JSON which has not been loaded yet");
		}

		return this._cache[path];
	},

	/**
	 * Tries to reload a given path if it is already cached
	 *
	 * @public
	 * @method module:JSON#reload
	 * @param {string} path - The path to be reloaded
	 */
	reload: function (path)
	{
		if (this._cache[path] !== undefined)
		{
			if (key !== undefined)
			{
				this.load(path, key, true);
				Log.JSON("Reloaded JSON file " + path);
			}
		}
	}
});

_.extend(Log, {
	/**
	 * Logs a JSON message in the console
	 * 
	 * @public
	 * @method module:Log#JSON
	 * @author Daniël Konings
	 */
	JSON: function (str) 
	{
		Log.rgb("[JSONManager] " + str, 100, 250, 220, 50, 100, 100);
	}
});