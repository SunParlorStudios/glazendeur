Enum("GameMode", [
	"Player",
	"Build",
	"Cutscene"
]);

var GameplayController = GameplayController || function(params)
{
	GameplayController._super.constructor.call(this, arguments);

	this._mode = GameMode.Player;

	this._modeTextures = {};

	this._modeTextures[GameMode.Player] = "textures/build_mode.png";
	this._modeTextures[GameMode.Build] = "textures/character_mode.png";
};

_.inherit(GameplayController, Entity);

_.extend(GameplayController.prototype, {
	initialise: function(camera, player)
	{
		this._camera = camera;
		this._player = player;

		this._modeSwitcher = new Button();
		this._modeSwitcher.setOnReleased(this.onSwitch, this);
		this._modeSwitcher.setOnPressed(this.onPressed, this);
		this._modeSwitcher.setOnEnter(this.onEnter, this);
		this._modeSwitcher.setOnLeave(this.onLeave, this);
		this._modeSwitcher.setSize(128, 128);
		this._modeSwitcher.spawn("UI");
		this._modeSwitcher.setBlend(0.8, 0.8, 0.8);
		this._modeSwitcher.setOffset(0.5, 0.5);
		this._modeSwitcher.setTranslation(960 - 280, 540 - 280);

		for (var k in this._modeTextures)
		{
			ContentManager.load("texture", this._modeTextures[k]);
		}

		this._modeSwitcher.setTextures(this._modeTextures[this._mode]);
		this._modeSwitcher.setDiffuseMap(this._modeTextures[this._mode]);
	},

	switchMode: function(mode)
	{
		switch(mode)
		{
			case GameMode.Player:
				this._camera.switchCam(CamMode.Player);
			break;

			case GameMode.Build:
				this._camera.switchCam(CamMode.Build);
			break;

			case GameMode.Cutscene:
				this._camera.switchCam(CamMode.Cutscene);
			break;
		}

		this._player.setMode(mode);

		this._mode = mode;
		this._modeSwitcher.setTextures(this._modeTextures[this._mode]);
	},

	onSwitch: function()
	{
		switch(this._mode)
		{
			case GameMode.Player:
				this.switchMode(GameMode.Build);
			break;

			case GameMode.Build:
				this.switchMode(GameMode.Player);
			break;
		}

		this._modeSwitcher.setScale(1.1, 1.1);
		this._modeSwitcher.setBlend(1, 1, 1);
	},

	onPressed: function()
	{
		this._modeSwitcher.setScale(0.9, 0.9);
		this._modeSwitcher.setBlend(0.5, 0.5, 0.5);
	},

	onLeave: function()
	{
		this._modeSwitcher.setScale(1, 1);
		this._modeSwitcher.setBlend(0.8, 0.8, 0.8);
	},

	onEnter: function()
	{
		this._modeSwitcher.setScale(1.1, 1.1);
		this._modeSwitcher.setBlend(1, 1, 1);
	},

	onUpdate: function(dt)
	{

	}
});