function Entity(args)
{
	this._renderables = args[1];
	this._world = args[2];
	this._active = true;
	this._translation = {
		x: 0,
		y: 0,
		z: 0
	}
}

_.extend(Entity.prototype, {
	active: function()
	{
		return this._active;
	},

	world: function()
	{
		return this._world;
	},

	setActivated: function(value)
	{
		this._active = value;
	},

	destroy: function()
	{
		for (var i = 0; i < this._renderables.length; ++i)
		{
			this._renderables[i].destroy();
		}
	},

	spawn: function(layer)
	{
		for (var i = 0; i < this._renderables.length; ++i)
		{
			this._renderables[i].spawn(layer);
		}
	},

	renderable: function(idx)
	{
		return this._renderables[idx];
	}
});