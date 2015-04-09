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

		this.info = data.info;
		this.resourcesToLoad = data.resources;
		this.stateName = data.to;

		this.info.resourcesPerFrame = data.info.resourcesPerFrame || 1;

		this.currentResource = 0;

		this.text = new Text();
		this.text.setText("Loading resources, now at 0%...");
		this.text.setFont("fonts/arial.ttf");
		this.text.setFontSize(30);
		this.text.setAlignment(TextAlignment.Center);
		this.text.setTranslation(0, 0, 0);
		this.text.spawn("UI");
	},

	update: function (dt)
	{
		Loader._super.update.call(this);

		if (this.resourcesToLoad[this.currentResource] == undefined)
		{
			//StateManager.switch(this.stateName);
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
		this.text.setText("Loading resources, now at " + percent + "%...");
	},

	draw: function ()
	{
		Game.render(Game.camera, RenderTargets.ui);
	},

	leave: function()
	{
		this.text.destroy();
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