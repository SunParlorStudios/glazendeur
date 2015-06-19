var Player = Player || function (params) 
{
	Player._super.constructor.call(this, arguments);

	this._model = this._renderables[0];
	this._model.setOffset(0, 0.5, 0);

	this._grid = params.grid;
	this._path = [];
	this._pathSettings = {
		node: 0,
		target: 0,
		ratio: 0
	};
	this._speed = 20;

	this._quads = [];

	this._model.setTranslation(280, 0, 220);

	this._position = Vector2D.construct(280, 220);
	this._mode = GameMode.Player;
};

_.inherit(Player, Entity);

_.extend(Player.prototype, {
	setMode: function(mode)
	{
		this._mode = mode;
	},

	onUpdate: function (dt)
	{
		this.updateControls(dt);

		this.updatePathing(dt);

		this._model.setTranslation(this._position.x, this._grid.getHeight(this._model.translation()), this._position.y);
	},

	updateControls: function (dt)
	{
		if (this._mode !== GameMode.Player)
		{
			return;
		}

		if (Controls.isPressed(Bindings.WalkCommand))
		{
			this._path = this._grid.findPathToMouse(this._model.translation());
			this._pathSettings.node = 0;
			this._pathSettings.target = 1;
			this._pathSettings.ratio = 0;
		}
	},

	updatePathing: function (dt)
	{
		if (this._path.length > 1)
		{
			var node = this._path[this._pathSettings.node];
			var target = this._path[this._pathSettings.target];
			this._pathSettings.ratio += this._speed * dt;
			var ratio = this._pathSettings.ratio;

			if (ratio > 1)
				ratio = 1;

			this._position.y = Math.lerp(node.x - 128 * 0.5, target.x - 128 * 0.5, ratio);
			this._position.x = Math.lerp(node.y - 128 * 0.5, target.y - 128 * 0.5, ratio);

			if (ratio == 1)
			{
				this._pathSettings.node++;
				this._pathSettings.target++;
				this._pathSettings.ratio = 0;

				if (this._pathSettings.target >= this._path.length)
				{
					this._path = [];
					this._pathSettings.node = 0;
					this._pathSettings.target = 0;
					this._pathSettings.ratio = 0;
				}
			}
		}
	},

	position: function () {
		return  this._model.translation();
	}
});