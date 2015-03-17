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
		this._light = new Light(LightType.Directional);
		this._light.setDirection(0, -1, -1);
		this._landscape = this.world.spawn("entities/landscape.json", {}, "Default");
		this._editor = this.world.spawn("entities/editor/editor.json", { terrain: this._landscape.terrain() });
	},

	update: function (dt)
	{
		Menu._super.update.call(this, dt);
	}
});