var WorldMap = WorldMap || function(params)
{
	WorldMap._super.constructor.call(this, arguments);

	this._numSegments = 9;
	this._landscapes = [];
	this._map = [];
	this._data = undefined;
}

_.inherit(WorldMap, Entity);

_.extend(WorldMap.prototype, {
	initialise: function()
	{
		var size = 3;
		var landscape;

		for (var y = 0; y < size; ++y)
		{
			for (var x = 0; x < size; ++x)
			{
				landscape = this.world().spawn("entities/world/visual/landscape.json", {}, "Default");
				landscape.setGridPosition(x, y);
				this._landscapes.push(landscape);
			}
		}

		if (IO.exists("json/map/map.json") == true)
		{
			this.load();
		}
	},

	landscapes: function()
	{
		return this._landscapes;
	},

	save: function()
	{
		var obj = {};
		var data;
		var grid = this._data === undefined ? {} : this._data.grid;
		for (var i = 0; i < this._landscapes.length; ++i)
		{
			data = this._landscapes[i].save(i);
			if (data !== undefined)
			{
				grid["" + data.pos.x + "_" + data.pos.y] = data.obj;
			}
		}

		obj.grid = grid;
		var save = JSON.stringify(obj);
		IO.write("json/map/map.json", save);

		this._data = obj;
	},

	load: function()
	{
		if (IO.exists("json/map/map.json") == false)
		{
			Log.warning("No terrain data exists to load");
			return;
		}

		var loadedData = JSON.parse(IO.read("json/map/map.json"));

		for (var i = 0; i < this._landscapes.length; ++i)
		{
			this._landscapes[i].load(i, loadedData);
		}

		this._data = loadedData;
	},

	onUpdate: function()
	{

	}
})