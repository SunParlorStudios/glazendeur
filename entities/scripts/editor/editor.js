var Editor = Editor || function(params)
{
	Editor._super.constructor.call(this, arguments);
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
}

_.inherit(Editor, Entity);

_.extend(Editor.prototype, {
	updateCircle: function(dt)
	{
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
			if (Keyboard.isDown(Key.Shift))
			{
				this._terrain.brushTexture("textures/brush.png", 
					this._textures[this._currentTexture].diffuse, 
					x2d, z2d, size, 
					this._textures[this._currentTexture].normal,
					this._textures[this._currentTexture].specular);
				
				return;
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
	},

	onUpdate: function(dt)
	{
		this.updateCircle(dt);
	}
});