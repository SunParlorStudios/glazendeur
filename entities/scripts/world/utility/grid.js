var WorldGrid = WorldGrid || function (params)
{
	WorldGrid._super.constructor.call(this, arguments);

	if (params.map === undefined)
	{
		Log.warning('When creating grid, you have to provide a reference to the map this grid should be attached to.');
		return;
	}

	this._map = params.map;
	this._cellWidth = params.cellWidth - 1;
	this._cellHeight = params.cellHeight - 1;
	this._grids = [];

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
			t.setTextureTiling(128 / 8, 128 / 8);
			t.brushTexture("textures/terrain/brushes/brush_1.png", "textures/tile.png", 64, 64, 99999, 1.0, "textures/tile_normal.png", "textures/tile_specular.png");
			t.setUniform(Uniform.Float, 'CellWidth', this._cellWidth);
			t.setUniform(Uniform.Float, 'CellHeight', this._cellHeight);
			t.spawn('Default');

			this._grids.push(t);
		}
	},

	display: function ()
	{
		
	},

	onUpdate: function (dt)
	{
		//WorldGrid._super.onUpdate.call(this, dt);
	}
});