ContentManager.load("model", "models/test_cube.fbx");

Enum("EditorTools", [
	"Raise",
	"Paint",
	"Smooth"
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

	this._billies = [];

	for (var i = 0; i < 300; ++i)
	{
		var billy = new Billboard();
		billy.spawn("Default");
		billy.setTranslation(Math.random() * 256, 0, Math.random() * 256);
		billy.setDiffuseMap("textures/tree.png");
		billy.setOffset(0.5, 1);
		var s = 4 + Math.random() * 4;
		billy.setSize(s, s);

		this._billies.push(billy);
	}
	

	this._terrain = params.terrain;
	this._editingCircle = this.world().spawn("entities/editor/editing_circle.json", {terrain: this._terrain}, "Default");
	this._camera = this.world().spawn("entities/editor/editor_camera.json", {camera: Game.camera}, "Default");

	this._radius = 5;

	this._textures = [
		{diffuse: "textures/grass.png", normal: "textures/grass_normal.png", specular: "textures/grass_specular.png"},
		{diffuse: "textures/cracked_floor.png", normal: "textures/cracked_floor_normal.png", specular: "textures/cracked_floor_specular.png"},
		{diffuse: "textures/rock.png", normal: "textures/rock_normal.png", specular: "textures/rock_specular.png"}
	]

	this._currentTexture = 0;
	this._history = new EditorHistory(this._terrain);
	this._historyPoint = false;
	this._inputEnabled = true;

	this._ui = new EditorUI(this);
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

		if (Keyboard.isReleased(Key[1]))
		{
			this._currentTexture = 0;
		}

		if (Keyboard.isReleased(Key[2]))
		{
			this._currentTexture = 1;
		}

		if (Keyboard.isReleased(Key[3]))
		{
			this._currentTexture = 2;
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

		var size = this._radius;
		var dist;
		if (Mouse.isDown(MouseButton.Right) || Mouse.isDown(MouseButton.Left))
		{
			if (this._currentTool == EditorTools.Paint)
			{
				this._terrain.brushTexture("textures/brush.png", 
					this._textures[this._currentTexture].diffuse, 
					x2d, z2d, size, 
					this._textures[this._currentTexture].normal,
					this._textures[this._currentTexture].specular);
				
				return;
			}

			if (this._historyPoint == false)
			{
				this._historyPoint = true;
				var hp = new HistoryPoint(this._terrain);
				this._history.addPoint(hp);
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

			this._terrain.flush();
		}

		if (Mouse.isReleased(MouseButton.Left) || Mouse.isReleased(MouseButton.Right))
		{
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

	onUpdate: function(dt)
	{
		this._model.rotateBy(0, dt, 0);
		this.updateCircle(dt);
	}
});