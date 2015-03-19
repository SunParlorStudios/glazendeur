var Landscape = Landscape || function(params)
{
	Landscape._super.constructor.call(this, arguments);
	this._terrain = this._renderables[0];
	this._terrain.setTextureTiling(16, 16);

	for (var i = 0; i < 100; ++i)
	{
		this._terrain.brushTexture("textures/brush.png", "textures/grass.png", 64, 64, 999, "textures/grass_normal.png");
	}
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