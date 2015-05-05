'use strict';

Enum("EditorTools", [
	"Raise",
	"Paint",
	"Smooth",
	"Ramp",
	"Flatten",
	"Props"
]);

Enum("PathTools", [
	"Walkable",
	"Unwalkable"
]);

Enum("EditMode", [
	"World",
	"Path"
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

	this.view = params.view;

	this._currentTool = EditorTools.Raise;
	this._editMode = EditMode.World;

	this._map = params.map;
	this._camera = params.camera;
}

_.inherit(Editor, Entity);

_.extend(Editor.prototype, {
	initialise: function()
	{
		this._landscapes = this._map.landscapes();
		this._terrain = this._landscapes[0].terrain();

		this._editingCircle = this.world().spawn("entities/editor/editing_circle.json", {terrain: this._terrain}, "UI");

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
		this._flattenHeight = 0;

		this._inputEnabled = [];
		this._currentGizmo = undefined;

		this._neighbours = [];
		this._cursorPosition = {x: 0, y: 0}

		this._brushStrength = {
			max: 100,
			min: 1,
			current: 0
		};

		this._brushStrength.current = this._brushStrength.max / 2;

		this._loadTextures();
		this._loadProps();

		this._ui = new EditorUI(this);
		this._placedProp = false;
	},
	
	_loadTextures: function()
	{
		this._texturePath = "textures/terrain/";
		this._brushes = IO.filesInDirectory(this._texturePath + "brushes");
		for (var i = 0; i < this._brushes.length; ++i)
		{
			ContentManager.load("texture", this._brushes[i]);
		}

		var textures = IO.filesInDirectory(this._texturePath + "textures");
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
				this._textures.push(this._texturePath + "textures/" + last);
			}	
		}

		this._currentBrush = 0;
	},

	_loadProps: function()
	{
		this._modelPath = "models/props";
		this._props = [];
		this._propDefinitions = [];

		var definition = {
			textures: {}
		};

		var directories = IO.filesInDirectory(this._modelPath, true);
		var prop;
		var path;

		var texturesToLoad = [
			"diffuse",
			"normal",
			"specular"
		];

		var texturePath;

		for (var i = 0; i < directories.length; ++i)
		{
			definition = {
				textures: {}
			};

			prop = directories[i].split("/");
			prop = prop[prop.length - 1];
			Log.debug("Found prop '" + prop + "'");

			path = this._modelPath + "/" + prop + "/" + prop;

			if (IO.exists(path + ".fbx") == false)
			{
				Log.error("No .fbx file was found for prop '" + prop + "'\nProp will not be loaded");
				continue;
			}

			definition.model = path + ".fbx";
			ContentManager.load("model", definition.model);

			for (var j = 0; j < texturesToLoad.length; ++j)
			{
				texturePath = path + "_" + texturesToLoad[j] + ".png";
				if (IO.exists(texturePath) == false)
				{
					Log.warning("Could not load texture '" + texturesToLoad[j] + "' for prop '" + prop + "'");
					continue;
				}

				definition.textures[texturesToLoad[j]] = texturePath;
				ContentManager.load("texture", texturePath);
			}

			Log.success("Loaded prop '" + prop + "'");
			this._props.push(prop);
			this._propDefinitions[prop] = definition;
		}
	},

	props: function()
	{
		return this._props;
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

	setBrushStrength: function(v)
	{
		v = Math.max(v, this._brushStrength.min);
		v = Math.min(v, this._brushStrength.max);

		this._brushStrength.current = v;
	},

	brushStrength: function()
	{
		return this._brushStrength;
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
		if (this._editMode == EditMode.World)
		{
			if (Keyboard.isPressed(Key.P))
			{
				this._editMode = EditMode.Path;
				this._currentTool = PathTools.Undefined;

				this._ui.switchTo(this._editMode);

				this._grid.display();
				return;
			}

			if (this.inputDisabled() == true)
			{
				return;
			}

			if (this._currentTool == EditorTools.Props)
			{
				var h;
				var index;
				var n;
				var cx = this._cursorPosition.x,
					cz = this._cursorPosition.z;

				var found = undefined;

				for (var i = 0; i < this._neighbours.length; ++i)
				{
					n = this._neighbours[i];
					index = n.terrain().worldToIndex(cx, cz);

					if (index.x !== undefined && index.y !== undefined)
					{
						h = n.terrain().getBilinearHeight(cx, cz);
						found = n;
						break;
					}
				}

				if (this._placedProp === false)
				{
					if (Mouse.isPressed(MouseButton.Left))
					{
						var selectedProp = this._ui.selectedProp();
						var definition = this._propDefinitions[selectedProp];

						this._newProp = this.world().spawn("entities/world/visual/prop.json", 
						{
							definition: definition, 
							editMode: true, 
							editor: this,
							translation: Vector3D.construct(cx, h, cz)
						},
						"Default");

						this._placedProp = true;
					}
				}
				else
				{
					if (Mouse.isReleased(MouseButton.Left) && found !== undefined)
					{
						this._newProp.place(found);
						this._placedProp = false;
						this._newProp = undefined;
						return;
					}

					this._newProp.setPosition(cx, h, cz);
				}

				if (Mouse.isReleased(MouseButton.Right))
				{
					var found = undefined;
					var lowest = 0;
					var ray = this._camera.projectRay();
					var landscape = undefined;
					var data = false;

					for (var i = 0; i < this._landscapes.length; ++i)
					{
						landscape = this._landscapes[i]
						data = landscape.pickProp(ray.origin.x, ray.origin.y, ray.origin.z, ray.direction.x, ray.direction.y, ray.direction.z);
						
						if (data !== false)
						{
							if (found === undefined)
							{
								lowest = data.distance;
								found = data.prop;
							}
							else if (data.distance < lowest)
							{
								lowest = data.distance;
								found = data.prop;
							}
						}
					}

					if (found !== undefined)
					{
						found.remove();
					}
				}

				return;
			}

			var averageHeight = [];
			var affected = [];
			for (var i = 0; i < this._neighbours.length; ++i)
			{
				averageHeight[i] = 0;
				affected[i] = [];
			}

			var neighbour;
			var terrain;
			var size = this._radius;
			var cx = this._cursorPosition.x,
				cy = this._cursorPosition.z;

			var indexPos;
			var indexHeight;
			var ratio;
			var total;

			var indices;

			if (this._currentTool == EditorTools.Paint && Mouse.isDown(MouseButton.Left))
			{
				var terrainIndex;
				for (var i = 0; i < this._neighbours.length; ++i)
				{
					neighbour = this._neighbours[i];
					terrain = neighbour.terrain();
					terrainIndex = terrain.worldToIndex(cx, cy);
					
					if (terrainIndex.x !== undefined && terrainIndex.y !== undefined)
					{
						var neighbours = this.getLandscapes(neighbour);

						for (var j = 0; j < neighbours.length; ++j)
						{
							neighbours[j].setEdited(false, true);
						}
					}

					var tex = this._ui.selectedTexture();
					terrain.brushTexture(this._brushes[this._currentBrush],
						tex + ".png",
						cx, cy, size, this._brushStrength.current / this._brushStrength.max,
						tex + "_normal.png",
						tex + "_specular.png");
				}

				return;
			}

			if (Mouse.isReleased(MouseButton.Left))
			{
				this._wasFlattening	= false;
				this._flattenHeight	= 0;
			}

			if (!Mouse.isDown(MouseButton.Left) && !Mouse.isDown(MouseButton.Right))
			{
				return;
			}

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
							indexPos = terrain.indexToWorld(indices.x, indices.y);

							ratio = 1 - Math.distance(indexPos.x, indexPos.z, cx, cy) / size;

							if (ratio < Number.EPSILON)
							{
								continue;
							}

							indexHeight = terrain.getHeight(indices.x, indices.y);

							if (this._currentTool == EditorTools.Raise)
							{
								total = dt * Math.easeInOutQuintic(ratio, 0, 1, 1) * this._brushStrength.current;

								if (Mouse.isDown(MouseButton.Left))
								{
									terrain.setHeight(indices.x, indices.y, indexHeight + total);
									neighbour.grid().updateHeight(neighbour, indices.x, indices.y, indexHeight + total);
									neighbour.setEdited(true, false);
								}
								else if (Mouse.isDown(MouseButton.Right))
								{
									terrain.setHeight(indices.x, indices.y, indexHeight - total);
									neighbour.grid().updateHeight(neighbour, indices.x, indices.y, indexHeight - total);
									neighbour.setEdited(true, false);
								}
							}
							else if ((this._currentTool == EditorTools.Flatten || this._currentTool == EditorTools.Smooth) && Mouse.isDown(MouseButton.Left))
							{
								averageHeight[i] += terrain.getHeight(indices.x, indices.y);
								indices.ratio = ratio;
								affected[i].push(indices);
							}
						}
					}
				}
			}

			var average = 0;
			var currentHeight, currentIndices;
			var currentIndex;

			if (this._currentTool == EditorTools.Flatten || this._currentTool == EditorTools.Smooth)
			{
				for (var i = 0; i < this._neighbours.length; ++i)
				{
					currentHeight = averageHeight[i];
					currentIndices = affected[i];

					if (currentIndices.length == 0)
					{
						continue;
					}

					average = currentHeight;
					average /= currentIndices.length;

					if (Mouse.isDown(MouseButton.Left))
					{
						if (this._currentTool == EditorTools.Flatten)
						{
							if (this._wasFlattening	== false)
							{
								this._wasFlattening	= true;
								this._flattenHeight = average;
							}

							for (var j = 0; j < currentIndices.length; ++j)
							{
								currentIndex = currentIndices[j];
								this._neighbours[i].terrain().setHeight(currentIndex.x, currentIndex.y, this._flattenHeight);
								this._neighbours[i].grid().updateHeight(this._neighbours[i], currentIndex.x, currentIndex.y, this._flattenHeight);
								this._neighbours[i].setEdited(true, false);
							}
						}
						else if (this._currentTool == EditorTools.Smooth)
						{
							var neighbourTerrain, smooth, worldPos, shared = [];
							var adjacentTerrain, adjacentIndex, found;
							var filterSize = 1;
							var num = 0;
							var avg = 0;
							var fx, fy;

							for (var j = 0; j < currentIndices.length; ++j)
							{
								avg = 0;
								num = 0;
								neighbourTerrain = this._neighbours[i].terrain();
								currentIndex = currentIndices[j];
								smooth = currentIndex.ratio;
								shared.length = 0;
								worldPos = neighbourTerrain.indexToWorld(currentIndex.x, currentIndex.y);

								for (var n = 0; n < this._neighbours.length; ++n)
								{
									if (this._neighbours[n] == this._neighbours[i])
									{
										continue;
									}

									adjacentTerrain = this._neighbours[n].terrain();

									adjacentIndex = adjacentTerrain.worldToIndex(worldPos.x, worldPos.z);

									if (adjacentIndex.x !== undefined && adjacentIndex.y !== undefined)
									{
										shared.push({index: adjacentIndex, landscape: this._neighbours[n]});
									}
								}

								for (var adjx = -filterSize; adjx <= filterSize; ++adjx)
								{
									for (var adjy = -filterSize; adjy <= filterSize; ++adjy)
									{
										fx = currentIndex.x + adjx;
										fy = currentIndex.y + adjy;

										if (fx < 0 || fy < 0 || fx >= neighbourTerrain.width() || fy >= neighbourTerrain.height())
										{
											for (var n = 0; n < this._neighbours.length; ++n)
											{
												if (this._neighbours[n] == this._neighbours[i])
												{
													continue;
												}

												adjacentIndex = adjacentTerrain.worldToIndex(worldPos.x + adjx, worldPos.z + adjy);

												if (adjacentIndex.x !== undefined && adjacentIndex.y !== undefined)
												{
													avg += adjacentTerrain.getHeight(adjacentIndex.x, adjacentIndex.y);
													++num;
													break;
												}
											}
										}
										else
										{
											avg += neighbourTerrain.getHeight(fx, fy);
											++num;
										}
									}	
								}
								avg /= num;
								var result = Math.lerp(neighbourTerrain.getHeight(currentIndex.x, currentIndex.y), avg, smooth * this._brushStrength.current / this._brushStrength.max);
								neighbourTerrain.setHeight(currentIndex.x, currentIndex.y, result);
								this._neighbours[i].grid().updateHeight(this._neighbours[i], currentIndex.x, currentIndex.y, result);
								this._neighbours[i].setEdited(true, false);

								var foundShared;
								for (var s = 0; s < shared.length; ++s)
								{
									foundShared = shared[s];
									foundShared.landscape.terrain().setHeight(foundShared.index.x, foundShared.index.y, result);
									foundShared.landscape.grid().updateHeight(foundShared.landscape, foundShared.index.x, foundShared.index.y, result);
									foundShared.landscape.setEdited(true, false);
								}
							}
						}
					}
				}
			}

			for (var i = 0; i < this._neighbours.length; ++i)
			{
				this._neighbours[i].terrain().flush();
				this._neighbours[i].flushGrid();
			}
		}
		else if (this._editMode == EditMode.Path)
		{
			if (Keyboard.isPressed(Key.P))
			{
				this._editMode = EditMode.World;
				this._ui.switchTo(this._editMode);
				this._grid.disappear();
				return;
			}

			if (this.inputDisabled() == true)
			{
				return;
			}

			switch (this._currentTool)
			{
				case PathTools.Walkable:
					if (Mouse.isPressed(MouseButton.Left))
					{

					}

					if (Mouse.isReleased(MouseButton.Right))
					{

					}
					break;
				case PathTools.Unwalkable:
					if (Mouse.isPressed(MouseButton.Left))
					{

					}

					if (Mouse.isReleased(MouseButton.Right))
					{

					}
					break;
			}
		}
	},

	save: function()
	{
		this._map.save();
	},

	load: function()
	{
		this._map.load();
	},

	textures: function()
	{
		return this._textures;
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