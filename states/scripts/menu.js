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

		this.view.play_button.setOnReleased(function () {
			StateManager.switch('level');
		}, this);

		this.view.option_button.setOnReleased(function () {
			this.moveOptionsIn();
		}, this);

		this.view.option_slider.option_quit.setOnReleased(function () {
			this.moveOptionsOut();
		}, this);

		this.view.quit_button.setOnReleased(function () {
			Game.quit();
		}, this);

		this.option_offset = 50;
	},

	moveOptionsIn: function ()
	{
		this.movingOptionsIn = true;
		this.beginTime = Game.time();
		this.beginTrans = this.view.option_slider.translation();
	},

	moveOptionsOut: function ()
	{
		this.movingOptionsOut = true;
		this.beginTime = Game.time();
		this.beginTrans = this.view.option_slider.translation();
	},

	update: function (dt)
	{
		Menu._super.update.call(this, dt);

		var mod = Math.clamp(Math.abs(Math.sin(Game.time() / 20)), 0.3, 1);

		this.view.cog_back.rotateBy(0, 0, -0.45 * mod * dt);
		this.view.cog_mid.rotateBy(0, 0, 0.4 * mod * dt);
		this.view.cog_front.rotateBy(0, 0, -0.3 * mod * dt);

		if (this.movingOptionsIn)
		{
			this.view.option_slider.setTranslation(
				Math.lerp(
					this.beginTrans.x, 
					(RenderSettings.resolution().w / 2) - (this.view.option_slider.size().x * this.view.option_slider.offset().x) - this.option_offset, 
					Math.easeInOutQuintic(Math.min(Game.time() - this.beginTime, 1), 0, 1, 1)
				),
				this.beginTrans.y,
				this.beginTrans.z
			);

			if (Math.min(Game.time() - this.beginTime, 1) >= 1)
			{
				this.movingOptionsIn = false;
			}
		}

		if (this.movingOptionsOut)
		{
			this.view.option_slider.setTranslation(
				Math.lerp(
					this.beginTrans.x, 
					(RenderSettings.resolution().w / 2) + (this.view.option_slider.size().x * this.view.option_slider.offset().x), 
					Math.easeInOutQuintic(Math.min(Game.time() - this.beginTime, 1), 0, 1, 1)
				),
				this.beginTrans.y,
				this.beginTrans.z
			);

			if (Math.min(Game.time() - this.beginTime, 1) >= 1)
			{
				this.movingOptionsOut = false;
			}
		}
	},

	draw: function ()
	{
		Menu._super.draw.call(this);

		Game.render(Game.camera, RenderTargets.ui);
	}
});