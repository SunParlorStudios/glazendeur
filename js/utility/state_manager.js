require("js/utility/state");

/**
 * The StateManager which manages the states
 *
 * @public
 * @singleton module:StateManager
 * @author Riko Ophorst
 */
var StateManager = {};

_.extend(StateManager, {
	overwrite: false,
	override: false
}, {
	/**
	 * Holds all states
	 *
	 * @private
	 * @property module:StateManager#_state
	 * @author Riko Ophorst
	 */
	_states: {}
});

_.extend(StateManager, {
	/**
	 * Loads a state from a given json file
	 *
	 * @public
	 * @method module:StateManager#loadState
	 * @param {string} path - The path to a valid state-formatted JSON file
	 * @author Riko Ophorst
	 */
	loadState: function (path)
	{
		var stateData = JSON.load(path);

		if (stateData.name !== undefined && stateData.scripts !== undefined)
		{
			require(stateData.scripts.path);
			
			var state = {
				name: stateData.name,
				script: stateData.scripts.path,
				ui: stateData.scripts.ui,
				class: stateData.scripts.class,
				resourcesCached: false,
				entities: stateData.entities,
				actual: new _GLOBAL_[stateData.scripts.class](),
				autoStart: stateData.autoStart,
				loader: stateData.loader,
				initialized: false,
			};

			this._states[state.name] = state;

			if (state.autoStart === true)
			{
				this.switch(state.name);
			}
		}
		else
		{
			Log.fatal("Trying to call StateManager.loadState() on a json file with incorrect structuring");
		}
	},

	/**
	 * Loads a save from a given path and adds it to the cache
	 *
	 * @public
	 * @method module:StateManager#loadSave
	 * @param {string} path - The path to a valid statesave-formatted JSON file
	 * @author Riko Ophorst
	 */
	loadSave: function (path)
	{
		var save = JSON.load(path);
		this._states[save.name] = save;
	},

	/**
	 * Switches the current state to given state
	 *
	 * @public
	 * @method module:StateManager#switch
	 * @param {string} name - The name of the state to switch to
	 * @param {object} leaveParams - leave parameters which are sent to the left states' leave() method
	 * @param {object} showParams - show parameters which are sent to the shown states' show() method
	 * @author Riko Ophorst
	 */
	switch: function (name, leaveParams, showParams)
	{
		// Handles leaving of the current state
		var state;
		if (this._current !== undefined)
		{
			state = this._states[this._current];
			state.actual.leave.call(state.actual, leaveParams);
		}
		else
		{
			showParams = leaveParams;
		}

		// Starts showing to the new state
		state = this._states[name];
		if (state === undefined)
		{
			Log.fatal('Trying to call StateManager.switch() on an invalid state name: ' + name);
			return;
		}

		// Wants the loader to preload some assets? If so, was it even loaded already? If that is also the case, then we invoke the loader to load the new state's resources
		if (!!state.loader && state.resourcesCached !== true)
		{
			var loader = this._states['loader'];

			Log.info('[STATEMANAGER] Switching state to loader');
			loader.actual.show.call(loader.actual, {
				info: state.loader.info,
				resources: state.loader.resources,
				to: state.name
			});

			this._current = 'loader';
			state.resourcesCached = true;
		}
		else
		{
			// Was the state ever initialized? If no, initialize it
			if (!state.initialized)
			{
				if (state.entities !== undefined && state.entities.length > 0)
				{
					for (var i = 0; i < state.entities.length; i++)
					{
						state.actual.world.spawn(state.entities[i].json, state.entities[i].params, state.entities[i].layer);
					}
				}

				state.initialized = true;

				Log.info('[STATEMANAGER] Initializing state ' + state.name);
				state.actual.init.call(state.actual);
			}

			// Switch to the new state
			Log.info('[STATEMANAGER] Switching state to ' + state.name);
			state.actual.show.call(state.actual, showParams);
			this._current = state.name;
		}
	},

	/**
	 * Attempts to make a save file of given state
	 *
	 * @public
	 * @method module:StateManager#save
	 * @param {string} name - The state to be saved, can be anything that has been loaded into the StateManager's cache
	 * @author Riko Ophorst
	 */
	save: function ()
	{
		//var save = state.serialize();
	},

	/**
	 * Updates the current state
	 *
	 * @public
	 * @method module:StateManager#update
	 * @param {number} dt - deltatime
	 * @author Riko Ophorst
	 */
	update: function (dt)
	{
		if (this._current !== undefined)
			this._states[this._current].actual.update(dt);
	},

	/**
	 * FixedUpdates the current state
	 *
	 * @public
	 * @method module:StateManager#fixedUpdate
	 * @author Riko Ophorst
	 */
	fixedUpdate: function ()
	{
		if (this._current !== undefined)
			this._states[this._current].actual.fixedUpdate();
	},

	/**
	 * Draws the current state
	 *
	 * @public
	 * @method module:StateManager#draw
	 * @author Riko Ophorst
	 */
	draw: function () 
	{
		if (this._current !== undefined)
			this._states[this._current].actual.draw();
	},

	/**
	 * Lets the current state know that given path was reloaded
	 *
	 * @public
	 * @method module:StateManager#reload
	 * @param {string} path - the path that was reloaded
	 * @author Riko Ophorst
	 */
	reload: function (path)
	{
		if (this._current !== undefined)
			this._states[this._current].actual.reload(path);
	},

	/**
	 * Lets the current state know the game is shutting down
	 *
	 * @public
	 * @method module:StateManager#shutdown
	 * @author Riko Ophorst
	 */
	shutdown: function ()
	{
		if (this._current !== undefined)
			this._states[this._current].actual.shutdown();
	},

	/**
	 * Retrieves the current state
	 *
	 * @public
	 * @method module:StateManager#current
	 * @author Riko Ophorst
	 */
	current: function ()
	{
		// Ternary operation here to prevent undefined errors
		return this._current !== undefined ? this._states[this._current].actual : undefined;
	}
});