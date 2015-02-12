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
	_states: {}
});

_.extend(StateManager, {
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
				resources: stateData.resources,
				resourcesCached: false,
				actual: new _GLOBAL_[stateData.scripts.class](),
				autoStart: stateData.autoStart
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
	loadSave: function (path)
	{
		var save = JSON.load(path);
		this._states[save.name] = save;
	},
	switch: function (name, leaveParams, showParams)
	{
		var state;
		if (this._current !== undefined)
		{
			state = this._states[current];

			state.actual.leave.call(state.actual, leaveParams);
		}
		else
		{
			showParams = leaveParams;
		}

		state = this._states[name];
		if (state === undefined)
		{
			Log.fatal('Trying to call StateManager.switch() on an invalid state name: ' + name);
			return;
		}

		if (!state.resourcesCached && state.invokeLoader === true)
			Loader.Process(state.resources);

		state.actual.show.call(state.actual, showParams);
		this._current = state.name;
	},
	save: function ()
	{
		//var save = state.serialize();
	},
	update: function (dt)
	{
		if (this._current !== undefined)
			this._states[this._current].actual.update(dt);
	},
	fixedUpdate: function ()
	{
		if (this._current !== undefined)
			this._states[this._current].actual.fixedUpdate();
	},
	draw: function () 
	{
		if (this._current !== undefined)
			this._states[this._current].actual.draw();
	},
	reload: function (path)
	{
		if (this._current !== undefined)
			this._states[this._current].actual.reload(path);
	},
	shutdown: function ()
	{
		if (this._current !== undefined)
			this._states[this._current].actual.shutdown();
	},
	current: function ()
	{
		return this._states[this._current].actual;
	}
});