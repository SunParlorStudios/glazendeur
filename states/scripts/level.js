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
}

_.inherit(Level, State);

_.extend(Level.prototype, {
	init: function()
	{
		this._editMode = CVar.get("editMode") == true;

		this._light = new Light(LightType.Directional);
		this._light.setDirection(0, -1, -1);
		Lighting.setAmbientColour(0.3, 0.2, 0.1);
		Lighting.setShadowColour(0.2, 0.3, 0.5);

		this._landscape = this.world.spawn("entities/world/visual/landscape.json", {}, "Default");
		this._camera = this.world.spawn("entities/world/gameplay/camera_control.json", {camera: Game.camera, editMode: this._editMode});

		if (this._editMode == true)
		{
			this._editor = this.world.spawn("entities/editor/editor.json", { terrain: this._landscape, camera: this._camera });
		}

		this._model = this.world.spawn("entities/world/visual/prop.json", { model: "models/test_house.fbx", textures: {}, editor: this._editor, editMode: this._editMode}, "Default");

		RenderTargets.water.setPostProcessing("effects/water.effect");
		RenderTargets.water.setTechnique("PostProcess");
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