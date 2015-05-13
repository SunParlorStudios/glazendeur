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
require("js/utility/astar");
require("js/ui/button");
require("js/input/controls");
require("js/input/mouse");

var RenderTargets = RenderTargets || {
	default: new RenderTarget("Default"),
	normals: new RenderTarget("Normals"),
	lighting: new RenderTarget("Lighting"),
	shore: new RenderTarget("Shore"),
	water: new RenderTarget("Water"),
	ui: new RenderTarget("UI")
};

_.extend(Log, {
	lime: function(str)
	{
		Log.rgb(str, 0, 0, 0, 225, 255, 0);
	},

	choc: function(str)
	{
		Log.rgb(str, 255, 125, 0, 80, 40, 0);
	},

	cyan: function(str)
	{
		Log.rgb(str, 0, 0, 0, 0, 255, 255);
	},

	mod: function(str)
	{
		var max = 80;
		var c = Math.sin(Game.time()) * max;

		var r1 = (255 - max) - c
		var r2 = max - c / 2;

		Log.rgb(str, r1, 0, r1, r2, 0, r2);
	},

	black: function(str)
	{
		Log.rgb(str, 255, 255, 255, 0, 0, 0);
	}
})

Game.Initialise = function()
{
	ContentManager.load("sound", "sounds/menu.wav");
	ContentManager.load("sound", "sounds/exploration.wav");

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
	Window.setSize(1920, 1080);

	RenderSettings.setVsync(true);
	RenderSettings.setResolution(1920, 1080);
	RenderSettings.setFullscreen(true);

	Game.camera = new Camera(CameraType.Perspective);
	Game.camera.setTranslation(0, 0, 0);

	StateManager.loadState('states/loader.json');
	StateManager.loadState('states/level.json');
	StateManager.loadState('states/menu.json');

	SoundSystem.addChannelGroup("Music");
	SoundSystem.play("sounds/menu.wav", "Music", true);

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