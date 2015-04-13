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
	show: function()
	{
		Menu._super.show.call(this);

		this.t = 0;

		this.view.play_button.setOnReleased(function () {
			//Log.info('PLAY BUTTON!!!');
		}, this);

		this.view.option_button.setOnReleased(function () {
			//Log.info('OPTION BUTTON!!!');
		}, this);

		this.view.quit_button.setOnReleased(function () {
			Game.quit();
		}, this);
	},

	update: function (dt)
	{
		Menu._super.update.call(this, dt);

		this.t += dt;

		var mod = Math.clamp(Math.abs(Math.sin(this.t / 20)), 0.3, 1);

		this.view.cog_back.rotateBy(0, 0, -0.45 * mod * dt);
		this.view.cog_mid.rotateBy(0, 0, 0.4 * mod * dt);
		this.view.cog_front.rotateBy(0, 0, -0.3 * mod * dt);
	},

	draw: function ()
	{
		Menu._super.draw.call(this);

		Game.render(Game.camera, RenderTargets.ui);
	}
});