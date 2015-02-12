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
	update: function (dt)
	{
		Menu._super.update.call(this, dt);

		var mx = 0,
			mz = 0,
			rx = 0,
			ry = 0,
			speed = 100 * dt;

		if (Keyboard.isDown("W"))
		{
			mz = -speed;
		}

		if (Keyboard.isDown("S"))
		{
			mz = speed;
		}

		if (Keyboard.isDown("A"))
		{
			mx = -speed;
		}

		if (Keyboard.isDown("D"))
		{
			mx = speed;
		}

		if (Mouse.isDown(0))
		{
			var movement = Mouse.movement();
			ry = -movement.x * dt / 10;
			rx = -movement.y * dt / 10;
		}

		Game.camera.translateBy(mx, 0, mz);
		Game.camera.rotateBy(rx, ry, 0);
	}
});