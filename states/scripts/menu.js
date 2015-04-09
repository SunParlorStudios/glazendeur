/** 
 * The menu state
 *
 * @public
 * @constructor module:Menu
 * @extends module:State
 * @author Riko Ophorst
 */
var Menu = Menu || function()
{
	Menu._super.constructor.call(this, arguments);
}

_.inherit(Menu, State);

_.extend(Menu.prototype, {
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
		var tex = {
			diffuse: "textures/test_house.png",
			normal: "textures/test_house.png",
			specular: "textures/test_house.png"
		}
		this._model = this.world.spawn("entities/world/visual/prop.json", {model: "models/test_house.fbx", textures: tex, editMode: this._editMode, editor: this._editor}, "Default");
		this._model2 = this.world.spawn("entities/world/visual/prop.json", {model: "models/test_house.fbx", textures: tex, editMode: this._editMode, editor: this._editor}, "Default");
	
		this._trees = [];
		
	},

	update: function (dt)
	{
		Menu._super.update.call(this, dt);
	}
});