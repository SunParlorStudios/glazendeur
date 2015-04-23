var WorldGrid = WorldGrid || function (params)
{
	WorldGrid._super.constructor.call(this, arguments);

	if (params.map === undefined)
	{
		Log.warning('When creating grid, you have to provide a reference to the map this grid should be attached to.');
		return;
	}

	this._map = params.map;
	this._grids = [];

	for (var i = 0; i < this._map.landscapes().length; i++)
	{
		this._map.landscapes()[i]._grid = this;
	}

	this.calculate();
};

_.inherit(WorldGrid, Entity);

_.extend(WorldGrid.prototype, {
	calculate: function ()
	{
		var landscapes = this._map.landscapes();
		for (var i = 0; i < landscapes.length; i++)
		{
			var t = new Terrain();
			t.create(128, 128);
			t.setTranslation(128 * landscapes[i].gridPosition().x, 1, 128 * landscapes[i].gridPosition().y);
			t.translateBy(-128 * 0.5, 0, -128 * 0.5);
			t.setTextureTiling(128, 128);
			t.brushTexture("textures/terrain/brushes/brush_1.png", "textures/tile.png", 64, 64, 99999, 1.0, "textures/tile_normal.png", "textures/tile_specular.png");
			t.spawn('Default');

			this._grids.push(t);
		}

		for (var x = 0; x < 3; x++)
		{
			for (var y = 0; y < 3; y++)
			{
				t = this._grids[x + 3 * y];

				for (var row = 0; row < 128; row++)
				{
					for (var col = 0; col < 128; col++)
					{
						t.setHeight(row - x, col - y, landscapes[x + 3 * y].terrain().getHeight(row, col) + 0.02);
					}
				}

				t.flush();
			}
		}
	},

	updateHeight: function (landscape, row, col)
	{
		var gridPos = landscape.gridPosition();
		var grid = this._grids[gridPos.x + 3 * gridPos.y];

		grid.setHeight(row - gridPos.x, col - gridPos.y, landscape.terrain().getHeight(row, col) + 0.02);
	},

	flush: function (landscape)
	{
		var gridPos = landscape.gridPosition();
		var grid = this._grids[gridPos.x + 3 * gridPos.y];

		grid.flush();
	},

	onUpdate: function (dt)
	{
		//WorldGrid._super.onUpdate.call(this, dt);
	}
});