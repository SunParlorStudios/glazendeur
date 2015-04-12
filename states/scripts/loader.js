/** 
 * The loader state
 *
 * @public
 * @constructor module:Loader
 * @extends module:State
 * @author Riko Ophorst
 */
var Loader = Loader || function()
{
	Loader._super.constructor.call(this, arguments);
}

_.inherit(Loader, State);

_.extend(Loader, {
	overwrite: false,
	override: false
}, {
	__loaded: false
});

_.extend(Loader.prototype, {
	show: function (data)
	{
		if (Loader.__loaded !== true)
		{
			var resources = this.view.GetResourceList();

			for (var i = 0; i < resources.length; i++)
			{
				ContentManager.load(resources[i][0], resources[i][1]);
			}

			Loader.__loaded = true;
		}

		Loader._super.show.call(this);

		this.info = data.info;
		this.resourcesToLoad = data.resources;
		this.stateName = data.to;

		for (var i = 0; i < data.uiResources.length; i++)
		{
			this.resourcesToLoad.push(data.uiResources[i]);
		}

		this.info.resourcesPerFrame = data.info.resourcesPerFrame || 1;

		this.currentResource = 0;
	},

	update: function (dt)
	{
		Loader._super.update.call(this);

		if (this.resourcesToLoad[this.currentResource] == undefined)
		{
			StateManager.switch(this.stateName);
			return;
		}

		for (var i = 0; i < this.info.resourcesPerFrame; i++)
		{
			var resource = this.resourcesToLoad[this.currentResource++];

			if (resource !== undefined)
				ContentManager.load(resource[0], resource[1]);
			else
				break;
		}

		var percent = Math.round((this.currentResource / this.resourcesToLoad.length) * 100);
		Log.Loader('Loader at ' + percent + '%');
		this.view.loader_text.setText("Loading resources, now at " + percent + "%...");
	},

	draw: function ()
	{
		Loader._super.draw.call(this);

		Game.render(Game.camera, RenderTargets.ui);
	},

	leave: function()
	{
		Loader._super.leave.call(this);
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
	Loader: function (str) 
	{
		Log.rgb("> " + str, 100, 250, 220, 50, 100, 100);
	}
});