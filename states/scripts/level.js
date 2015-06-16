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
		Level._super.init.call(this);

		this._light = new Light(LightType.Directional);
		this._light.setDirection(0, -1, -1);
	},

	show: function()
	{
		Level._super.show.call(this);

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
			camera: this._camera
		});
		this._map._grid = this._grid;

		if (this._editMode == true)
		{
			this._editor = this.world.spawn("entities/editor/editor.json", { 
				map: this._map, 
				camera: this._camera,
				view: this.view
			});
			this._map.setEditor(this._editor);
			this._editor._grid = this._grid;
		}
		else
		{
			this.view.root_world.destroy();
			this.view.root_path.destroy();
			this.view.input.destroy();
			this.view.root_world.raise.destroy();
			this.view.root_world.paint.destroy();
			this.view.root_world.smooth.destroy();
			this.view.root_world.ramp.destroy();
			this.view.root_world.flatten.destroy();
			this.view.root_world.props.destroy();
			this.view.root_path.walkable.destroy();
			this.view.root_path.unwalkable.destroy();
			this._editor = this.world.spawn("entities/editor/editor.json", { 
				map: this._map, 
				camera: this._camera,
				view: this.view
			});
			this._editor.setActivated(false);
			this._editor._loadProps();
		}

		this._map.initialise();

		if (this._editMode == true)
		{
			this._editor.initialise();
		}

		if (IO.exists("json/map/map.json") == true)
		{
			this._map.load();
		}

		if (this._editMode)
			this._grid.createVisuals();

		this._grid.calculate();
		this._grid.load();

		if (this._editMode == false)
		{
			this._gameplay = this.world.spawn("entities/world/gameplay/gameplay_controller.json", {});

			this._player = this.world.spawn("entities/player/player.json", { 
				grid: this._grid
			}, "Default");

			this._gameplay.initialise(this._camera, this._player);

			this._camera.setTarget(this._player);
			this._camera.switchCam(CamMode.Player);

			//this._gameplay.switchMode(GameMode.Build);
		}
		else
		{
			this._camera.switchCam(CamMode.Editor);
		}
	},

	update: function (dt)
	{
		Level._super.update.call(this, dt);
	},

	draw: function ()
	{
		Level._super.draw.call(this);

		Game.render(Game.camera, RenderTargets.default);
		Game.render(Game.camera, RenderTargets.water);
		Game.render(Game.camera, RenderTargets.ui);
		RenderTargets.shore.clearAlbedo();
	}
});