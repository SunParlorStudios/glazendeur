var EditingCircle = EditingCircle || function(params)
{
	EditingCircle._super.constructor.call(this, arguments);
	this._circle = this._renderables[0];
	this._segments = 10;
	this._radius = 5;
	this._thickness = 0.5;

	this._circle.setTopology(Topology.TriangleStrip);
	this._terrain = params.terrain;
}

_.inherit(EditingCircle, Entity);

_.extend(EditingCircle.prototype, {
	onUpdate: function(dt)
	{
		return;
		this._circle.clearVertices();
		this._circle.clearIndices();

		var ax, az, x, z, xx, zz;
		var t, indices, h;
		var count = -1;
		var scalar = Math.PI * 2 / this._segments;

		for (var i = 0; i < Math.PI * 2; i += scalar)
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
				h = -this._terrain.getHeight(indices.x, indices.y);
			}
			else
			{
				h = Number.MAX_VALUE;
			}

			this._circle.addVertex(x, h, z, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0);
			this._circle.addVertex(xx, h, zz, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0);

			this._circle.addIndex(++count);
			this._circle.addIndex(++count);
		}

		this._circle.flush(false);
	},

	setPosition: function(x, z)
	{
		this._circle.setTranslation(x, 0.5, z);
	}
});