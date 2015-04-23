/** 
 * The Level state
 *
 * @public
 * @constructor module:Level
 * @extends module:State
 * @author Riko Ophorst
 */
var Level = Level || function()
{
	Level._super.constructor.call(this, arguments);
};

_.inherit(Level, State);

_.extend(Level.prototype, {
	init: function ()
	{
		this._light = new Light(LightType.Directional);
		this._light.setDirection(0, -1, -1);
	},

	show: function()
	{
		this._editMode = CVar.get("editMode") == true;

		Lighting.setAmbientColour(0.3, 0.2, 0.1);
		Lighting.setShadowColour(0.2, 0.3, 0.5);

		RenderTargets.water.setPostProcessing("effects/water.effect");
		RenderTargets.water.setTechnique("PostProcess");

		/**
		* The map
		*/
		this._map = this.world.spawn("entities/world/visual/world_map.json", { 
			editMode: this._editMode
		});
		this._map.initialise();

		/**
		* The camera
		*/
		this._camera = this.world.spawn("entities/world/gameplay/camera_control.json", { 
			camera: Game.camera, 
			editMode: this._editMode
		});

		/**
		* The grid
		*/
		this._grid = this.world.spawn("entities/world/utility/grid.json", {
			map: this._map,
			cellWidth: 8,
			cellHeight: 8
		});
		this._grid.display();

		if (this._editMode == true)
		{
			this._editor = this.world.spawn("entities/editor/editor.json", { 
				map: this._map, 
				camera: this._camera 
			});
			this._map.setEditor(this._editor);
		}
	},

	update: function (dt)
	{
		Level._super.update.call(this, dt);
	},

	draw: function ()
	{
		Game.render(Game.camera, RenderTargets.default);
		Game.render(Game.camera, RenderTargets.water);
		Game.render(Game.camera, RenderTargets.ui);
		RenderTargets.shore.clearAlbedo();
	}
});