var Player = Player || function (params) 
{
	Player._super.constructor.call(this, arguments);

	this._model = this._renderables[0];
	this._model.setOffset(0, 0.5, 0);

	this._grid = params.grid;
	this._path = [];
};

_.inherit(Player, Entity);

_.extend(Player.prototype, {
	onUpdate: function ()
	{
		this.updateControls();

		this.updatePathing();
	},

	updateControls: function ()
	{
		if (Controls.isPressed(Bindings.WalkCommand))
		{
			this._path = this._grid.findPathToMouse(this._model.translation());

			Log.info(this._path.length);
		}
	},

	updatePathing: function ()
	{
		if (this._path.length > 0)
		{

		}
	}
});