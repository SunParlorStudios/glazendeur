var Landscape = Landscape || function(params)
{
	Landscape._super.constructor.call(this, arguments);
	this._terrain = this._renderables[0];
	this._terrain.create(128, 128);
	//this._terrain.setTextureTiling(32, 32);
	this._gridPosition = {x: 0, y: 0};

	this._waterPlane = this._renderables[1];
	this._waterPlane.create(128, 128);
	this._waterPlane.destroy();
	this._waterPlane.spawn("Water");
	this._waterPlane.setTranslation(0, -10, 0);

	this._editMode = params.editMode;
	this._editor = params.editor;

	this._terrain.setOffset(this._terrain.width() / 2, 0, this._terrain.height() / 2);
	this._waterPlane.setOffset(this._waterPlane.width() / 2, 0, this._waterPlane.height() / 2);
	this._edited = {
		height: true,
		texture: true
	};

	this._props = [];

	this.initialise();
};

_.inherit(Landscape, Entity);

_.extend(Landscape.prototype, {
	initialise: function()
	{
		for (var i = 0; i < 10; ++i)
		{
			this._terrain.brushTexture("textures/terrain/brushes/brush_1.png", "textures/terrain/textures/grass.png", 64, 64, 99999, 1.0, "textures/terrain/textures/grass_normal.png", "textures/terrain/textures/grass_specular.png");
		}

		this._waterPlane.setDiffuseMap("textures/terrain/ocean/ocean.png");
		this._waterPlane.setNormalMap("textures/terrain/ocean/ocean_normal.png");
		this._waterPlane.setSpecularMap("textures/terrain/ocean/ocean_specular.png");
		this._waterPlane.setTechnique("Default");
		this._waterPlane.setEffect("effects/water.effect");
	},

	setEdited: function(height, texture, props)
	{
		this._edited.height = this._edited.height == true ? true : height;
		this._edited.texture = this._edited.texture == true ? true : texture;
		this._edited.props = this._edited.props == true ? true : props;
	},

	edited: function()
	{
		return this._edited;
	},

	load: function(index, loadedData)
	{
		Log.info("Loading terrain data of segment " + index);

		var index = "" + this._gridPosition.x + "_" + this._gridPosition.y;
		var obj = loadedData.grid[index];

		this._terrain.loadTexture("textures/terrain/map/map_" + index);

		for (var y = 0; y < this._terrain.height(); ++y)
		{
			for (var x = 0; x < this._terrain.width(); ++x)
			{
				this._terrain.setHeight(x, y, obj.indices[y * this._terrain.width() + x]);
			}
		}

		this._props = [];

		if (obj.props !== undefined)
		{
			var propData;
			var prop;
			for (var i = 0; i < obj.props.length; ++i)
			{
				propData = obj.props[i];
				prop = this.world().spawn("entities/world/visual/prop.json", {
					editMode: this._editMode,
					editor: this._editor,
					definition: propData.definition,
					translation: Vector3D.construct(0, 0, 0)
				}, "Default");

				prop.load(propData);
				prop.place(this);
			}
		}

		this._terrain.flush();
		
		this._edited = {
			height: false,
			texture: false,
			props: false
		};
		
		Log.success("Loaded terrain data");
	},

	save: function(index)
	{
		if (this._edited.texture == true)
		{
			this._terrain.saveTexture("textures/terrain/map/map_" + this._gridPosition.x + "_" + this._gridPosition.y);
			this.setEdited(false, false);
		}

		if (this._edited.height == false && this._edited.props == false)
		{
			return;
		}

		Log.info("Saving terrain data of segment " + index);
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
		toSave.props = [];

		Log.info("Saving prop data of segment " + index);
		for (var i = 0; i < this._props.length; ++i)
		{
			toSave.props.push(this._props[i].save());
		}

		Log.success("Saved terrain data");

		this._edited = {
			height: false,
			texture: false,
			props: false
		};

		return {
			pos: this._gridPosition,
			obj: toSave
		};
	},

	terrain: function()
	{
		return this._terrain;
	},

	waterPlane: function()
	{
		return this._waterPlane;
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

	flushGrid: function ()
	{
		this._grid.flush(this);
	},

	grid: function()
	{
		return this._grid;
	},

	onUpdate: function(dt)
	{
		
	},

	addProp: function(prop)
	{
		this._props.push(prop);
		this.setEdited(false, false, true);
	},

	removeProp: function(prop)
	{
		for (var i = this._props.length - 1; i >= 0; --i)
		{
			if (this._props[i] == prop)
			{
				this._props.splice(i, 1);
				break;
			}
		}

		this.setEdited(false, false, true);
	},

	pickProp: function(ox, oy, oz, dx, dy, dz)
	{
		var found = undefined;
		var lowest = undefined;
		var prop = undefined;
		var intersection = undefined;

		for (var i = 0; i < this._props.length; ++i)
		{
			prop = this._props[i];
			intersection = prop.model().rayIntersection(ox, oy, oz, dx, dy, dz);

			if (intersection !== false)
			{
				if (found === undefined)
				{
					found = prop;
					lowest = intersection;
				}
				else if (intersection < lowest)
				{
					found = prop;
					lowest = intersection;
				}
			}
		}

		if (found === undefined)
		{
			return false;
		}

		return {
			distance: lowest,
			prop: prop
		};
	}
});
