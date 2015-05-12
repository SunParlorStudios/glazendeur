var Player = Player || function (params) 
{
	Player._super.constructor.call(this, arguments);

	this._model = this._renderables[0];
	this._model.setOffset(0, 0.5, 0);
};

_.inherit(Player, Entity);

_.extend(Player.prototype, {
	onUpdate: function ()
	{
		
	},

	updateControls: function ()
	{

	}
});