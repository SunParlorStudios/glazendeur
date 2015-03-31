var Landscape = Landscape || function(params)
{
	Landscape._super.constructor.call(this, arguments);
	this._terrain = this._renderables[0];
	this._terrain.setTextureTiling(32, 32);

	this._waterPlane = this._renderables[1];
	this._waterPlane.destroy();
	this._waterPlane.spawn("Forward");
	this._waterPlane.setTranslation(0, -10, 0);
}

_.inherit(Landscape, Entity);

_.extend(Landscape.prototype, {
	terrain: function()
	{
		return this._terrain
	},

	waterPlane: function()
	{
		return this._waterPlane
	},

	onUpdate: function(dt)
	{
		
	}
});