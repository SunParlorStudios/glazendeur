var EditingCircle = EditingCircle || function(params)
{
	EditingCircle._super.constructor.call(this, arguments);
	this._circle = this._renderables[0];
	this._segments = 60;
	this._radius = 5;
	this._thickness = 0.5;

	this._landscapes = [];

	for (var i = 0; i <= this._segments; ++i)
	{
		this._circle.addVertex(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
		this._circle.addVertex(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);

		this._circle.addIndex(0);
		this._circle.addIndex(0);
	}

	this._circle.create(false);
	this._circle.setTopology(Topology.TriangleStrip);
	this._circle.setTechnique("Diffuse");
};

_.inherit(EditingCircle, Entity);

_.extend(EditingCircle.prototype, {
	setLandscapes: function(scapes)
	{
		this._landscapes = scapes;
	},

	setRadius: function(r)
	{
		this._radius = r;
	},

	setBlend: function(r, g, b)
	{
		this._circle.setBlend(r, g, b);
	},

	onUpdate: function(dt)
	{
		if (this._landscapes.length == 0)
		{
			return;
		}
		
		var ax, az, x, z, xx, zz;
		var t, h;
		var count = -1;
		var scalar = Math.PI * 2 / this._segments;
		var currentIndices = undefined;
		var chosen = undefined;

		for (var i = 0; i <= Math.PI * 2; i += scalar)
		{
			ax = Math.cos(i);
			az = Math.sin(i);

			x = ax * this._radius;
			z = az * this._radius;

			xx = ax * (this._radius - this._thickness);
			zz = az * (this._radius - this._thickness);

			t = this._circle.translation();

			for (var j = 0; j < this._landscapes.length; ++j)
			{
				currentIndices = this._landscapes[j].terrain().worldToIndex(t.x + x, t.z + z);

				if (currentIndices.x === undefined || currentIndices.y === undefined)
				{
					continue;
				}

				chosen = this._landscapes[j].terrain();
				break;
			}

			if (currentIndices.x !== undefined && currentIndices.y !== undefined)
			{
				h = -chosen.getBilinearHeight(t.x + x, t.z + z);
			}
			else
			{
				h = Number.MAX_VALUE;
			}

			this._circle.setVertex(++count, x, h, z, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0);
			this._circle.setVertex(++count, xx, h, zz, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0);

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