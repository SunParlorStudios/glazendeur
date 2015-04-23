require("js/lib/bottom_line");
require("js/utility/broadcaster");
require("js/utility/state_manager");
require("js/utility/math_extension");
require("js/utility/weighted_collection");
require("js/utility/json");
require("js/utility/enumerator");
require("js/utility/vector2d");
require("js/utility/vector3d");
require("js/utility/ray");
require("js/utility/world");
require("js/ui/button");

var RenderTargets = RenderTargets || {
	default: new RenderTarget("Default"),
	normals: new RenderTarget("Normals"),
	lighting: new RenderTarget("Lighting"),
	shore: new RenderTarget("Shore"),
	water: new RenderTarget("Water"),
	ui: new RenderTarget("UI")
};

Game.Initialise = function()
{
	RenderTargets.shore.setClearAlbedo(false);

	RenderTargets.default.setClearDepth(true);
	RenderTargets.default.setLightingEnabled(true);
	RenderTargets.default.addMultiTarget(RenderTargets.normals);
	RenderTargets.default.addMultiTarget(RenderTargets.lighting);
	RenderTargets.default.addMultiTarget(RenderTargets.shore);

	RenderTargets.water.setClearDepth(false);
	RenderTargets.water.setLightingEnabled(false);
	RenderTargets.water.addMultiTarget(RenderTargets.shore);

	RenderTargets.ui.setClearDepth(true);
	RenderTargets.ui.setLightingEnabled(false);
	RenderTargets.ui.setTechnique("Diffuse");

	Window.setName("Withering Shores");
	Window.setSize(1280, 720);

	RenderSettings.setVsync(true);
	RenderSettings.setResolution(1920, 1080);

	Game.camera = new Camera(CameraType.Perspective);
	Game.camera.setTranslation(0, 0, 0);

	StateManager.loadState('states/loader.json');
	StateManager.loadState('states/level.json');
	StateManager.loadState('states/menu.json');

	StateManager.switch('menu');
};

Game.Update = function(dt)
{
	StateManager.update(dt);
};

Game.Draw = function(dt)
{
	StateManager.draw();
};

Game.Shutdown = function()
{
	RenderTargets.default.clear();
	RenderTargets.water.clear();
	RenderTargets.ui.clear();
	StateManager.shutdown();
};

Game.FixedUpdate = function()
{
	StateManager.fixedUpdate();
};

Game.OnReload = function(path)
{
	StateManager.reload(path);
};