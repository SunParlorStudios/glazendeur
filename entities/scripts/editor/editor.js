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

	this._landscapes = params.landscapes;
	this._terrain = this._landscapes[0].terrain();

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

	this._inputEnabled = [];
	this._currentGizmo = undefined;

	this._ui = new EditorUI(this);
	this._ui.setCurrentTexture(this._textures[this._currentTexture] + ".png");
	this._ui.setCurrentBrush(this._brushes[this._currentBrush]);

	this._neighbours = [];
	this._cursorPosition = {x: 0, y: 0}
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

	getLandscapes: function(found)
	{
		var gridPos = found.gridPosition();
		var x = gridPos.x;
		var y = gridPos.y;

		var landscape;

		var neighbours = [];

		var isNeighbour = function(px, py, landscape)
		{
			var grid = landscape.gridPosition();
			var gx = grid.x;
			var gy = grid.y;

			for (var yy = py - 1; yy <= py + 1; ++yy)
			{
				for (var xx = px - 1; xx <= px + 1; ++xx)
				{
					if (gx == xx && gy == yy)
					{
						return true;
					}
				}
			}

			return false;
		};

		for (var i = 0; i < this._landscapes.length; ++i)
		{
			landscape = this._landscapes[i];

			if (isNeighbour(x, y, landscape) == true)
			{
				neighbours.push(landscape);
			}
		}

		return neighbours;
	},

	updateCircle: function(dt)
	{
		var ray = this._camera.projectRay();
		var intersection = false;
		var lowest, found = undefined;
		var landscape;

		for (var i = 0; i < this._landscapes.length; ++i)
		{
			landscape = this._landscapes[i]
			intersection = landscape.terrain().rayIntersection(ray.origin.x, ray.origin.y, ray.origin.z, ray.direction.x, ray.direction.y, ray.direction.z);
			
			if (intersection !== false)
			{
				if (found === undefined)
				{
					lowest = intersection;
					found = landscape;
				}
				else if (intersection < lowest)
				{
					lowest = intersection;
					found = landscape;
				}
			}
		}

		if (found === undefined)
		{
			return;
		}

		this._neighbours = this.getLandscapes(found);

		this._editingCircle.setRadius(this._radius);

		var p = this._camera.mouseToWorld();
		this._cursorPosition = Ray.getIntersectionPoint(ray, lowest);

		this._editingCircle.setPosition(this._cursorPosition.x, this._cursorPosition.z);
		this._editingCircle.setLandscapes(this._neighbours);

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
	},

	updateTools: function(dt)
	{
		if (Mouse.isDown(MouseButton.Left) == false)
		{
			return;
		}
		
		var neighbour;
		var terrain;
		var size = this._radius;
		var cx = this._cursorPosition.x,
			cy = this._cursorPosition.z;

		var indices;

		for (var x = cx - size; x < cx + size; ++x)
		{
			for (var y = cy - size; y < cy + size; ++y)
			{
				for (var i = 0; i < this._neighbours.length; ++i)
				{
					neighbour = this._neighbours[i];
					terrain = neighbour.terrain();

					indices = terrain.worldToIndex(x, y);

					if (indices.x !== undefined && indices.y !== undefined)
					{	
						terrain.setHeight(indices.x, indices.y, 10);
					}
				}
			}
		}

		for (var i = 0; i < this._neighbours.length; ++i)
		{
			this._neighbours[i].terrain().flush();
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
		this.updateTools(dt);
	}
});