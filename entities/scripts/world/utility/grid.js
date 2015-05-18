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
	save: function ()
	{
		var save = JSON.stringify(this._main);
		IO.write('json/astar.json', save);
	},

	load: function ()
	{
		var save = JSON.parse(IO.read('json/astar.json'));
		this._main = save;

		for (var row = 0; row < 128 * 3; row++)
		{
			for (var col = 0; col < 128 * 3; col++)
			{
				for (var t = 0; t < this._grids.length; t++)
				{
					this._grids[t].brushTexture(
						"textures/terrain/brushes/brush_5.png", 
						this._main[row][col] == true ? "textures/tile.png" : "textures/tile_unwalkable.png", 
						row - (128 * 0.5) - 0.5, 
						col - (128 * 0.5) - 0.5, 
						0.5, 
						1, 
						"textures/tile_normal.png", 
						"textures/tile_specular.png"
					);
				}
			}
		}

		AStar.setGrid(this._main, 128 * 3);
	},

	createVisuals: function ()
	{
		var landscapes = this._map.landscapes();
		for (var i = 0; i < landscapes.length; i++)
		{
			var t = new Terrain();
			t.create(128, 128);
			t.setTranslation(128 * landscapes[i].gridPosition().x, 0.005, 128 * landscapes[i].gridPosition().y);
			t.translateBy(-128 * 0.5, 0, -128 * 0.5);
			t.setTextureTiling(128, 128);
			t.setAlpha(0.5);

			for (var x = 0; x < 128; x++)
			{
				for (var y = 0; y < 128; y++)
				{
					t.brushTexture(
						"textures/terrain/brushes/brush_5.png", 
						"textures/tile.png", 
						x - (128 * 0.5) + (landscapes[i].gridPosition().x * 128), 
						y - (128 * 0.5) + (landscapes[i].gridPosition().y * 128), 
						0.5, 
						1, 
						"textures/tile_normal.png", 
						"textures/tile_specular.png"
					);
				}
			}

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
	},

	calculate: function ()
	{
		var landscapes = this._map.landscapes();
		for (var i = 0; i < landscapes.length; i++)
		{
			landscapes[i]._grid = this;
		}

		for (var row = 0; row < 128 * (landscapes.length / 3); row++)
		{
			this._main[row] = [];
			
			for (var col = 0; col < 128 * (landscapes.length / 3); col++)
			{
				this._main[row][col] = true;
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
		var c = circle._circle.translation();
		var mpos = this.toGridPosition(c);
		var landscapes = this._grids;

		var affected = [],
			size = circle.getRadius(),
			cx = c.x,
			cy = c.z;

		for (var x = cx - size; x < cx + size; ++x)
		{
			for (var y = cy - size; y < cy + size; ++y)
			{
				var dist = Math.distance(cx, cy, x, y);

				if (dist <= size)
				{
					affected.push({x: x, z: y});
				}
			}
		}

		if (walkable === true)
		{
			for (var i = 0; i < affected.length; i++)
			{
				var tile = affected[i];
				var pos = this.toGridPosition(tile);

				if (this._main[pos.row][pos.col] === false)
				{
					for (var t = 0; t < landscapes.length; t++)
					{
						landscapes[t].brushTexture(
							"textures/terrain/brushes/brush_5.png", 
							"textures/tile.png", 
							pos.row - 128 * 0.5 - 0.5, 
							pos.col - 128 * 0.5 - 0.5, 
							0.5, 
							1, 
							"textures/tile_normal.png", 
							"textures/tile_specular.png"
						);
					}

					this._main[pos.row][pos.col] = true;
				}
			}
		}
		else
		{
			for (var i = 0; i < affected.length; i++)
			{
				var tile = affected[i];
				var pos = this.toGridPosition(tile);

				if (this._main[pos.row][pos.col] !== false)
				{
					for (var t = 0; t < landscapes.length; t++)
					{
						landscapes[t].brushTexture(
							"textures/terrain/brushes/brush_5.png", 
							"textures/tile_unwalkable.png", 
							pos.row - 128 * 0.5 - 0.5, 
							pos.col - 128 * 0.5 - 0.5, 
							0.5, 
							1, 
							"textures/tile_normal.png", 
							"textures/tile_specular.png"
						);
					}

					this._main[pos.row][pos.col] = false;
				}
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
		{
			var endTile = this.posToTile(end);

			if (this._main[endTile.y][endTile.x] !== false)
				return AStar.findPath(this.posToTile(start), endTile, AStar.DiagonalDistance);
		}

		return [];
	},

	getHeight: function (position)
	{
		var lx = Math.floor((position.x + 128 * 0.5) / 128);
		var ly = Math.floor((position.z + 128 * 0.5) / 128);

		var landscapes = this._map.landscapes();
		var landscape;
		for (var i = 0; i < landscapes.length; i++)
		{
			if (landscapes[i].gridPosition().x === lx && landscapes[i].gridPosition().y === ly)
			{
				landscape = landscapes[i];
			}
		}

		return landscape.terrain().getHeight((position.x + 128 * 0.5) - 128 * lx, (position.z + 128 * 0.5) - 128 * ly);
	},

	onUpdate: function (dt)
	{
		if (Keyboard.isDown(Key.Control))
		{
			if (Keyboard.isReleased(Key.S))
			{
				this.save();
			}
			else if (Keyboard.isReleased(Key.O))
			{
				this.load();
			}
		}
	}
});