require("js/lib/bottom_line");
require("js/utility/broadcaster");
require("js/utility/state_manager");
require("js/utility/math_extension");
require("js/utility/weighted_collection");
require("js/utility/json");
require("js/utility/enumerator");
require("js/utility/vector2d");
require("js/utility/world");

var RenderTargets = RenderTargets || {
	default: RenderTarget.new("Default")
}

Game.Initialise = function()
{
	Game.setName("Snuffbox Template");

	RenderSettings.setVsync(true);
	RenderSettings.setResolution(1280,720);
	RenderSettings.setYDown(true);
	RenderSettings.setWindowSize(1280,720);
	RenderSettings.setCullMode(RenderSettings.CullNone)

	Game.debug = true;
	Game.speed = 1;

	Game.camera = Camera.new("perspective");

	Game.world = new World();

	Game.world.spawn("entities/test.json", {width: 1024, height: 1024, x: 0}, "Default");
	Game.world.spawn("entities/test.json", {width: 1024, height: 1024, x: 32}, "Default");

	Game.widget = Widget.new();
	Game.widget.setSize(64, 64);
}

Game.Update = function(dt)
{
	if (Game.debug == true)
	{
		var oldSpeed = Game.speed;
		if (Keyboard.isReleased("OEM4"))
		{
			Game.speed /= 1.5;
		}
		else if (Keyboard.isReleased("OEM6"))
		{
			Game.speed *= 1.5;
		}

		if (oldSpeed != Game.speed)
		{
			Log.rgb("Game speed changed to: " + Game.speed, 255, 255, 255, 127, 127, 127);
		}

		dt *= Game.speed;
	}

	Game.world.update(dt);

	var mx = 0,
		mz = 0,
		rx = 0,
		ry = 0,
		speed = 30 * dt;

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
		ry = -movement.x * dt;
		rx = -movement.y * dt;
	}

	Game.camera.translateBy(mx, 0, mz);
	Game.camera.rotateBy(rx, ry, 0);
}

Game.Draw = function(dt)
{
	Game.render(Game.camera);
}

Game.Shutdown = function()
{

}

Game.FixedUpdate = function()
{

}

Game.OnReload = function(path)
{
	StateManager.reload(path);
}