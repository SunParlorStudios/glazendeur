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

	},

	update: function (dt)
	{
		Menu._super.update.call(this, dt);
	}
});