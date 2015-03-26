ContentManager.load("model", "models/test_cube.fbx");

Enum("EditorTools", [
	"Raise",
	"Paint",
	"Smooth",
	"Ramp",
	"Flatten"
]);

Enum("Ramp", [
	"Start",
	"End"
]);

require("js/ui/editor/editor_ui");
require("entities/scripts/editor/editor_history");

var Editor = Editor || function(params)
{
	Editor._super.constructor.call(this, arguments);
	this._currentTool = EditorTools.Raise;

	this._model = new Model("models/test_cube.fbx");
	this._model.spawn("Default");
	this._model.setTranslation(64, 0, 64);

	Lighting.setAmbientColour(0.3, 0.2, 0.1);
	Lighting.setShadowColour(0.2, 0.3, 0.5);

	this._terrain = params.terrain;
	this._editingCircle = this.world().spawn("entities/editor/editing_circle.json", {terrain: this._terrain}, "Default");
	this._camera = this.world().spawn("entities/editor/editor_camera.json", {camera: Game.camera}, "Default");

	this._radius = 5;
	this._editingCircle.setBlend(1, 0, 0);

	this._contentPath = "textures/terrain/"
	this._brushes = IO.filesInDirectory(this._contentPath + "brushes");
	for (var i = 0; i < this._brushes.length; ++i)
	{
		ContentManager.load("texture", this._brushes[i]);
	}

	var textures = IO.filesInDirectory(this._contentPath + "textures");
	var texture, last;
	var split = [];

	this._textures = [];
	for (var i = 0; i < textures.length; ++i)
	{
		texture = textures[i];
		ContentManager.load("texture", texture);
		split = texture.split("/");
		split = split[split.length - 1].split(".png");
		last = split[0];

		if (last.split("_normal").length == 1 && last.split("_specular").length == 1)
		{
			this._textures.push(this._contentPath + "textures/" + last);
		}	
	}

	this._currentTexture = 0;
	this._currentBrush = 0;
	this._currentHeight = 0;

	this._rampStartCenter = {x: 0, y: 0};
	this._rampEndCenter = {x: 0, y: 0};
	this._affectedStart = [];
	this._affectedEnd = [];

	this._rampStart = 0;
	this._rampEnd = 0;
	this._wasRamping = Ramp.Start;
	this._wasFlattening = false;

	this._history = new EditorHistory(this._terrain);
	this._historyPoint = false;
	this._inputEnabled = true;

	this._ui = new EditorUI(this);
	this._ui.setCurrentTexture(this._textures[this._currentTexture] + ".png");
	this._ui.setCurrentBrush(this._brushes[this._currentBrush]);

	for (var i = 0; i < 10; ++i)
	{
		this._terrain.brushTexture(this._brushes[this._currentBrush], "textures/terrain/textures/grass.png", 64, 64, 99999, 1.0, "textures/terrain/textures/grass_normal.png", "textures/terrain/textures/grass_specular.png");
	}

	if (IO.exists("json/terrain/map.json"))
	{
		this.load();
	}
}

_.inherit(Editor, Entity);

_.extend(Editor.prototype, {
	setInputEnabled: function(input)
	{
		this._inputEnabled = input;
	},

	setTool: function(tool)
	{
		this._currentTool = tool;
	},

	updateCircle: function(dt)
	{
		if (this._inputEnabled == false)
		{
			return;
		}

		if (Keyboard.isDown(Key.OEM4))
		{
			this._radius -= dt * 10;
		}
		else if (Keyboard.isDown(Key.OEM6))
		{
			this._radius += dt * 10;
		}

		this._editingCircle.setRadius(this._radius);

		var p = Mouse.position(MousePosition.Relative);
		p.x = (p.x + RenderSettings.resolution().w / 2);
		p.y = (p.y + RenderSettings.resolution().h / 2);

		var unprojA = Game.camera.unproject(p.x, p.y, Game.camera.nearPlane());
		var unprojB = Game.camera.unproject(p.x, p.y, Game.camera.farPlane());

		var f = unprojA.y / (unprojB.y - unprojA.y);
		var x2d = unprojA.x - f * (unprojB.x - unprojA.x);
		var z2d = unprojA.z - f * (unprojB.z - unprojA.z);

		this._editingCircle.setPosition(x2d, z2d);

		var affected = [];
		var average = 0;

		var size = this._radius;
		var dist;
		if (Mouse.isDown(MouseButton.Right) || Mouse.isDown(MouseButton.Left))
		{
			if (this._currentTool == EditorTools.Paint)
			{
				this._terrain.brushTexture(this._brushes[this._currentBrush], 
					this._textures[this._currentTexture] + ".png",
					x2d, z2d, size, 0.1,
					this._textures[this._currentTexture] + "_normal.png",
					this._textures[this._currentTexture] + "_specular.png");
				
				return;
			}

			if (this._historyPoint == false)
			{
				this._historyPoint = true;
				var hp = new HistoryPoint(this._terrain);
				this._history.addPoint(hp);
			}

			if (this._currentTool == EditorTools.Ramp)
			{
				if (this._wasRamping == Ramp.Start)
				{
					this._rampStartCenter = this._terrain.worldToIndex(x2d, z2d);
				}
				else if (this._wasRamping == Ramp.End)
				{
					this._rampEndCenter = this._terrain.worldToIndex(x2d, z2d);
				}
			}

			for (var x = x2d - size; x < x2d + size; ++x)
			{
				for (var y = z2d - size; y < z2d + size; ++y)
				{
					var indices = this._terrain.worldToIndex(x, y);
					if (indices.x === undefined || indices.y === undefined)
					{
						continue;
					}
					dist = Math.distance(x, y, x2d, z2d);

					if (dist < 0)
					{
						dist = 0;
					}
					t = 1 - dist / size;

					var e = Math.easeInOutQuintic(t, 0, size, 1);

					if (e < 0)
					{
						e = 0;
					}

					var h = this._terrain.getHeight(indices.x, indices.y);

					if (this._currentTool == EditorTools.Smooth && t > 0)
					{
						var avg = 0;
						var num = 0;
						var filterSize = 1;
						for (var adjx = -filterSize; adjx <= filterSize; ++adjx)
						{
							for (var adjy = -filterSize; adjy <= filterSize; ++adjy)
							{
								++num;
								avg += this._terrain.getHeight(indices.x + adjx, indices.y + adjy);
							}
						}

						var smooth = avg / num;
						this._terrain.setHeight(indices.x, indices.y, Math.lerp(h, smooth, t));

						continue;
					}
					else if (this._currentTool == EditorTools.Ramp)
					{
						this._editingCircle.setBlend(1, 1, 0);

						if ((this._wasRamping == Ramp.Start || this._wasRamping == Ramp.End) && t > 0)
						{
							average += this._terrain.getHeight(indices.x, indices.y);
							affected.push({x: indices.x, y: indices.y});
						}

						continue;
					}
					else if (this._currentTool == EditorTools.Flatten)
					{
						if (t > 0)
						{
							average += this._terrain.getHeight(indices.x, indices.y);
							affected.push({x: indices.x, y: indices.y});
						}

						continue;
					}
					else if (this._currentTool == EditorTools.Raise)
					{
						if (Mouse.isDown(MouseButton.Left))
						{
							this._terrain.setHeight(indices.x, indices.y, h + e * dt);
						}
						else
						{
							this._terrain.setHeight(indices.x, indices.y, h - e * dt);
						}
					}
				}
			}

			if (this._currentTool == EditorTools.Ramp)
			{
				average /= affected.length;
				if (this._wasRamping == Ramp.Start)
				{
					this._affectedStart = affected;
					this._rampStart = average;
					this._wasRamping = Ramp.End;
				}
				else if (this._wasRamping == Ramp.End)
				{
					this._affectedEnd = affected;
					this._rampEnd = average;
				}
			}
			else if (this._currentTool == EditorTools.Flatten)
			{
				if (this._wasFlattening == false)
				{
					this._editingCircle.setBlend(0, 1, 0);
					this._wasFlattening = true;
					this._currentHeight = average / affected.length;
				}
				
				var indices = {x: 0, y: 0};
				for (var i = 0; i < affected.length; ++i)
				{
					indices = affected[i];
					this._terrain.setHeight(indices.x, indices.y, this._currentHeight);
				}
			}

			this._terrain.flush();
		}

		if (Mouse.isReleased(MouseButton.Left) || Mouse.isReleased(MouseButton.Right))
		{
			if (this._wasFlattening == true)
			{
				this._editingCircle.setBlend(1, 0, 0);
				this._wasFlattening = false;
			}

			if (this._wasRamping == Ramp.End)
			{
				var a = this._terrain.indexToWorld(this._rampStartCenter.x, this._rampStartCenter.y);
				var b = this._terrain.indexToWorld(this._rampEndCenter.x, this._rampEndCenter.y);

				var xx, zz, h, ox, oz;
				var d = Math.distance(a.x, a.z, b.x, b.z);
				var index;
				var size = this._radius;
				var dist, index;

				for (var i = 0; i < d; ++i)
				{
					xx = Math.lerp(a.x, b.x, i / d);
					zz = Math.lerp(a.z, b.z, i / d);

					for (var rx = xx - size; rx < xx + size; ++rx)
					{
						for (var rz = zz - size; rz < zz + size; ++rz)
						{
							ox = rx - xx;
							oz = rz - zz;

							index = this._terrain.worldToIndex(rx, rz);

							if (index.x !== undefined && index.y !== undefined)
							{
								dist = Math.distance(rx, rz, b.x - ox, b.z - oz);

								h = Math.lerp(a.y, b.y, 1.0 - dist / d);
								this._terrain.setHeight(index.x, index.y, h);
							}
						}
					}
				}

				this._wasRamping = Ramp.Start;
				this._editingCircle.setBlend(1, 0, 0);

				this._terrain.flush();
			}

			this._historyPoint = false;
			var last = new HistoryPoint(this._terrain);
			this._history.addPoint(last);
		}

		if (Keyboard.isDown(Key.Control) && Keyboard.isReleased(Key.Z))
		{
			this._history.undo();
		}

		if (Keyboard.isDown(Key.Control) && Keyboard.isReleased(Key.Y))
		{
			this._history.redo();
		}
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

	changeTexture: function()
	{
		++this._currentTexture;

		if (this._currentTexture >= this._textures.length)
		{
			this._currentTexture = 0;
		}

		this._ui.setCurrentTexture(this._textures[this._currentTexture] + ".png");
	},

	changeBrush: function()
	{
		++this._currentBrush;

		if (this._currentBrush >= this._brushes.length)
		{
			this._currentBrush = 0;
		}

		this._ui.setCurrentBrush(this._brushes[this._currentBrush]);
	},

	updateSaving: function(dt)
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
	},

	onUpdate: function(dt)
	{
		this._model.rotateBy(0, dt, 0);
		this.updateCircle(dt);
		this.updateSaving(dt);
	}
});