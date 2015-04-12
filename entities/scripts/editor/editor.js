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

Enum("InputDisable", [
	"UI",
	"Gizmo"
]);

require("js/ui/editor/editor_ui");
require("entities/scripts/editor/editor_history");

var Editor = Editor || function(params)
{
	Editor._super.constructor.call(this, arguments);

	this._loadTextures();
	this._currentTool = EditorTools.Raise;

	this._landscape = params.terrain;
	this._terrain = params.terrain.terrain();

	this._editingCircle = this.world().spawn("entities/editor/editing_circle.json", {terrain: this._terrain}, "UI");
	this._camera = params.camera;

	this._radius = 5;
	this._editingCircle.setBlend(1, 0, 0);

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
	this._inputEnabled = [];
	this._currentGizmo = undefined;

	this._ui = new EditorUI(this);
	this._ui.setCurrentTexture(this._textures[this._currentTexture] + ".png");
	this._ui.setCurrentBrush(this._brushes[this._currentBrush]);
}

_.inherit(Editor, Entity);

_.extend(Editor.prototype, {
	_loadTextures: function()
	{
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
	},

	addInputDisable: function(type)
	{
		this._inputEnabled[type] = true;
	},

	removeInputDisable: function(type)
	{
		this._inputEnabled[type] = false;
	},

	inputDisabled: function()
	{
		for (var i = 0; i < this._inputEnabled.length; ++i)
		{
			if (this._inputEnabled[i] == true)
			{
				return true;
			}
		}

		return false;
	},

	setCurrentGizmo: function(gizmo)
	{
		this._currentGizmo = gizmo;
	},

	currentGizmo: function()
	{
		return this._currentGizmo;
	},

	setTool: function(tool)
	{
		this._currentTool = tool;
	},

	updateCircle: function(dt)
	{
		var ray = this._camera.projectRay();
		var d = this._terrain.rayIntersection(ray.origin.x, ray.origin.y, ray.origin.z, ray.direction.x, ray.direction.y, ray.direction.z);

		this._editingCircle.setRadius(this._radius);

		var p = this._camera.mouseToWorld();
		var x2d = ray.origin.x + ray.direction.x * d;
		var z2d = ray.origin.z + ray.direction.z * d;

		this._editingCircle.setPosition(x2d, z2d);

		if (this.inputDisabled() == true)
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
								h = Math.lerp(a.y, b.y, i / d);
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
		this._landscape.save();
	},

	load: function()
	{
		this._landscape.load();
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

	camera: function()
	{
		return this._camera;
	},

	onUpdate: function(dt)
	{
		this.updateCircle(dt);
		this.updateSaving(dt);
	}
});