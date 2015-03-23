var EditingCircle = EditingCircle || function(params)
{
	EditingCircle._super.constructor.call(this, arguments);
	this._circle = this._renderables[0];
	this._segments = 360;
	this._radius = 5;
	this._thickness = 0.5;

	this._terrain = params.terrain;

	for (var i = 0; i <= this._segments; ++i)
	{
		this._circle.addVertex(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
		this._circle.addVertex(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

		this._circle.addIndex(0);
		this._circle.addIndex(0);
	}

	this._circle.create(false);
	this._circle.setTopology(Topology.TriangleStrip);
}

_.inherit(EditingCircle, Entity);

_.extend(EditingCircle.prototype, {
	setRadius: function(r)
	{
		this._radius = r;
	},

	onUpdate: function(dt)
	{
		var ax, az, x, z, xx, zz;
		var t, indices, h;
		var count = -1;
		var scalar = Math.PI * 2 / this._segments;

		for (var i = 0; i <= Math.PI * 2; i += scalar)
		{
			ax = Math.cos(i);
			az = Math.sin(i);

			x = ax * this._radius;
			z = az * this._radius;

			xx = ax * (this._radius - this._thickness);
			zz = az * (this._radius - this._thickness);

			t = this._circle.translation();
			indices = this._terrain.worldToIndex(t.x + xx, t.z + zz);

			if (indices.x !== undefined && indices.y !== undefined)
			{
				h = -this._terrain.getBilinearHeight(t.x + x, t.z + z);
			}
			else
			{
				h = Number.MAX_VALUE;
			}

			this._circle.setVertex(++count, x, h, z, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0);
			this._circle.setVertex(++count, xx, h, zz, 1, 0, 0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0);

			this._circle.setIndex(count - 1, count - 1);
			this._circle.setIndex(count, count);
		}

		this._circle.flush(false);
	},

	setPosition: function(x, z)
	{
		this._circle.setTranslation(x, 1, z);
	}
});