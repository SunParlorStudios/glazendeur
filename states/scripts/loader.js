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

_.extend(Loader.prototype, {
	show: function (data)
	{
		Loader._super.show.call(this);

		Log.watch('data', data.resources[0]);

		this.info = data.info;
		this.resourcesToLoad = data.resources;
		this.stateName = data.to;

		this.info.resourcesPerFrame = data.info.resourcesPerFrame || 1;

		this.currentResource = 0;
	},

	update: function (dt)
	{
		Loader._super.update.call(this);

		for (var i = 0; i < this.info.resourcesPerFrame; i++)
		{
			var resource = this.resourcesToLoad[this.currentResource++];

			if (resource !== undefined)
				ContentManager.load(resource.type, resource.path);
			else
				break;
		}

		Log.info('[LOADER] Loader at ' + Math.round(((this.currentResource-1) / this.resourcesToLoad.length) * 100) + '%');

		if (this.resourcesToLoad[this.currentResource] == undefined)
		{
			StateManager.switch(this.stateName);
		}
	}
});