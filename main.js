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
	RenderSettings.setCullMode(RenderSettings.CullNone);

	Game.debug = true;
	Game.speed = 1;

	Game.camera = Camera.new("perspective");
	Game.camera.setTranslation(256, -128, 256);
	Game.camera.setRotation(-Math.PI / 4, 0, 0);

	Game.world = new World();

	ContentManager.load("shader", "shaders/terrain.fx");
	Game.world.spawn("entities/landscape.json", {width: 512, height: 512, x: 0}, "Default");

	StateManager.loadState('states/menu.json');
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
		ry = -movement.x * dt;
		rx = -movement.y * dt;
	}

	Game.camera.translateBy(mx, 0, mz);
	Game.camera.rotateBy(rx, ry, 0);

	StateManager.update(dt);
}

Game.Draw = function(dt)
{
	Game.render(Game.camera);
	StateManager.draw();
}

Game.Shutdown = function()
{
	StateManager.shutdown();
}

Game.FixedUpdate = function()
{
	StateManager.fixedUpdate();
}

Game.OnReload = function(path)
{
	StateManager.reload(path);
}