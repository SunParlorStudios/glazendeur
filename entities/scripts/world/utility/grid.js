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
	this._main = [];

	this._camera = params.camera;
};

_.inherit(WorldGrid, Entity);

_.extend(WorldGrid.prototype, {
	calculate: function ()
	{
		for (var i = 0; i < this._map.landscapes().length; i++)
		{
			this._map.landscapes()[i]._grid = this;
		}
		
		var landscapes = this._map.landscapes();
		for (var i = 0; i < landscapes.length; i++)
		{
			var t = new Terrain();
			t.create(128, 128);
			t.setTranslation(128 * landscapes[i].gridPosition().x, 0.001, 128 * landscapes[i].gridPosition().y);
			t.translateBy(-128 * 0.5, 0, -128 * 0.5);
			t.setTextureTiling(128, 128);
			t.brushTexture("textures/terrain/brushes/brush_1.png", "textures/tile.png", 64, 64, 99999, 1.0, "textures/tile_normal.png", "textures/tile_specular.png");

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
						t.setHeight(row - x, col - y, landscapes[x + 3 * y].terrain().getHeight(row, col));
					}
				}

				t.flush();
			}
		}

		for (var row = 0; row < 128 * (landscapes.length / 3); row++)
		{
			this._main[row] = [];
			
			for (var col = 0; col < 128 * (landscapes.length / 3); col++)
			{
				this._main[row][col] = {};
			}
		}

		AStar.setGrid(this._main, 128 * 3);
	},

	updateHeight: function (landscape, row, col)
	{
		var gridPos = landscape.gridPosition();
		var grid = this._grids[gridPos.x + 3 * gridPos.y];

		grid.setHeight(row - gridPos.x, col - gridPos.y, landscape.terrain().getHeight(row, col));
	},

	toGridPosition: function (world)
	{
		return {
			row: Math.round(world.x - 128 * 0.5) + 128, 
			col: Math.round(world.z - 128 * 0.5) + 128
		};
	},

	makeWalkable: function (circle, walkable)
	{
		var pos = this.toGridPosition(circle._circle.translation());

		Log.info(pos.row + ', ' + pos.col);

		if (walkable === true)
		{
			if (this._main[pos.row][pos.col] === false)
			{
				var item = new Quad();
				item.setSize(1, 1);
				item.setRotation(Math.PI / 2, 0, 0);
				item.setTranslation(pos.row - 128 * 0.5, 1, pos.col - 128 * 0.5);
				item.setTechnique("Diffuse");
				item.setEffect("effects/cull_none.effect");
				item.spawn("UI");

				this._main[pos.row][pos.col] = item;
			}
		}
		else
		{
			if (this._main[pos.row][pos.col] !== false)
			{
				this._main[pos.row][pos.col].destroy();
				this._main[pos.row][pos.col] = false;
			}
		}
	},

	flush: function (landscape)
	{
		var gridPos = landscape.gridPosition();
		var grid = this._grids[gridPos.x + 3 * gridPos.y];

		grid.flush();
	},

	display: function ()
	{
		for (var i = 0; i < this._grids.length; i++)
		{
			this._grids[i].spawn('Default');
		}
	},

	disappear: function ()
	{	
		for (var i = 0; i < this._grids.length; i++)
		{
			this._grids[i].destroy();
		}
	},

	posToTile: function(pos)
	{
		return { x: Math.round((pos.z + 128 * 0.5)), y: Math.round((pos.x + 128 * 0.5)) }
	},

	findPathToMouse: function (start)
	{
		var end = Mouse.getTerrainPosition(this._camera, this._map.landscapes());
		
		if (end)
			return AStar.findPath(this.posToTile(start), this.posToTile(end), AStar.DiagonalDistance);

		return [];
	},

	onUpdate: function (dt)
	{
		//WorldGrid._super.onUpdate.call(this, dt);
	}
});