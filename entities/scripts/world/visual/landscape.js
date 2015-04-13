var Landscape = Landscape || function(params)
{
	Landscape._super.constructor.call(this, arguments);
	this._terrain = this._renderables[0];
	this._terrain.create(128, 128);
	this._terrain.setTextureTiling(32, 32);
	this._gridPosition = {x: 0, y: 0}

	this._waterPlane = this._renderables[1];
	this._waterPlane.create(128, 128);
	this._waterPlane.destroy();
	this._waterPlane.spawn("Water");
	this._waterPlane.setTranslation(0, -10, 0);

	this._terrain.setOffset(this._terrain.width() / 2, 0, this._terrain.height() / 2);
	this._waterPlane.setOffset(this._waterPlane.width() / 2, 0, this._waterPlane.height() / 2);

	this.initialise();

	terrain = this;
}

_.inherit(Landscape, Entity);

_.extend(Landscape.prototype, {
	initialise: function()
	{
		for (var i = 0; i < 10; ++i)
		{
			this._terrain.brushTexture("textures/terrain/brushes/brush_1.png", "textures/terrain/textures/grass.png", 64, 64, 99999, 1.0, "textures/terrain/textures/grass_normal.png", "textures/terrain/textures/grass_specular.png");
		}

		if (IO.exists("json/terrain/map.json"))
		{
			this.load();
		}

		this._waterPlane.setDiffuseMap("textures/terrain/ocean/ocean.png");
		this._waterPlane.setNormalMap("textures/terrain/ocean/ocean_normal.png");
		this._waterPlane.setSpecularMap("textures/terrain/ocean/ocean_specular.png");
		this._waterPlane.setTechnique("Default");
		this._waterPlane.setEffect("effects/water.effect");
	},

	load: function()
	{
		Log.info("Loading terrain data");
		var json = JSON.load("json/terrain/map.json", true);

		if (json.indices === undefined)
		{
			Log.error("Terrain data corrupt, could not find indices list");
			return;
		}

		this._terrain.loadTexture("textures/terrain/map/map");

		for (var y = 0; y < this._terrain.height(); ++y)
		{
			for (var x = 0; x < this._terrain.width(); ++x)
			{
				this._terrain.setHeight(x, y, json.indices[y * this._terrain.width() + x]);
			}
		}

		this._terrain.flush();
		
		Log.success("Loaded terrain data");
	},

	save: function()
	{
		Log.info("Saving terrain data");
		var toSave = {};
		var terrainIndices = [];

		for (var y = 0; y < this._terrain.height(); ++y)
		{
			for (var x = 0; x < this._terrain.width(); ++x)
			{
				terrainIndices[y * this._terrain.width() + x] = this._terrain.getHeight(x, y);
			}
		}

		toSave.indices = terrainIndices;
		var mapData = JSON.stringify(toSave);
		IO.write("json/terrain/map.json", mapData);
		this._terrain.saveTexture("textures/terrain/map/map");
		Log.success("Saved terrain data");
	},

	terrain: function()
	{
		return this._terrain
	},

	waterPlane: function()
	{
		return this._waterPlane
	},

	setGridPosition: function(x, y)
	{
		var w = this._terrain.width() - 1;
		var h = this._terrain.height() - 1;

		this._terrain.setTranslation(w * x, 0, h * y);
		this._gridPosition = {x: x, y: y}
	},

	gridPosition: function()
	{
		return this._gridPosition;
	},

	onUpdate: function(dt)
	{
		
	}
});