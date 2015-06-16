Enum("GameMode", [
	"Player",
	"Build",
	"Cutscene"
]);

var GameplayController = GameplayController || function(params)
{
	GameplayController._super.constructor.call(this, arguments);

	this._mode = GameMode.Character;
};

_.inherit(GameplayController, Entity);

_.extend(GameplayController.prototype, {
	initialise: function(camera, player)
	{
		this._camera = camera;
		this._player = player;
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
	},

	onUpdate: function(dt)
	{

	}
});