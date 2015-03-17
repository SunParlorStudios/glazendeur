var Landscape = Landscape || function(params)
{
	Landscape._super.constructor.call(this, arguments);
	this._terrain = this._renderables[0];
}

_.inherit(Landscape, Entity);

_.extend(Landscape.prototype, {
	terrain: function()
	{
		return this._terrain
	},

	onUpdate: function(dt)
	{
		
	}
});