require("js/lib/bottom_line");
require("js/utility/broadcaster");
require("js/utility/state_manager");
require("js/utility/math_extension");
require("js/utility/weighted_collection");
require("js/utility/json");
require("js/utility/enumerator");
require("js/utility/vector2d");
require("js/utility/vector3d");
require("js/utility/world");

var RenderTargets = RenderTargets || {
	default: new RenderTarget("Default"),
	normals: new RenderTarget("Normals"),
	lighting: new RenderTarget("Lighting"),
	ui: new RenderTarget("UI")
}

Game.Initialise = function()
{
	ContentManager.load("texture", "textures/brush.png");

	ContentManager.load("texture", "textures/cracked_floor.png");
	ContentManager.load("texture", "textures/cracked_floor_normal.png");
	ContentManager.load("texture", "textures/cracked_floor_specular.png");

	ContentManager.load("texture", "textures/grass.png");
	ContentManager.load("texture", "textures/grass_normal.png");
	ContentManager.load("texture", "textures/grass_specular.png");

	ContentManager.load("texture", "textures/rock.png");
	ContentManager.load("texture", "textures/rock_normal.png");
	ContentManager.load("texture", "textures/rock_specular.png");

	RenderTargets.default.setClearDepth(true);
	RenderTargets.default.setLightingEnabled(true);
	RenderTargets.default.addMultiTarget(RenderTargets.normals);
	RenderTargets.default.addMultiTarget(RenderTargets.lighting);

	RenderTargets.ui.setClearDepth(true);
	RenderTargets.ui.setLightingEnabled(false);

	Window.setName("Project Glazen Deur");
	Window.setSize(1280, 720);

	RenderSettings.setVsync(true);
	RenderSettings.setResolution(1280, 720);

	Game.camera = new Camera(CameraType.Perspective);
	Game.camera.setTranslation(0, 0, 0);

	StateManager.loadState('states/loader.json');
	StateManager.loadState('states/menu.json');

	StateManager.switch('menu');
}

Game.Update = function(dt)
{
	StateManager.update(dt);
}

Game.Draw = function(dt)
{
	StateManager.draw();
	Game.render(Game.camera, RenderTargets.default);
	//Game.render(Game.camera, RenderTargets.ui);
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