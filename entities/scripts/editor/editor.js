var Editor = Editor || function(params)
{
	Editor._super.constructor.call(this, arguments);
	this._terrain = params.terrain;
	this._editingCircle = this.world().spawn("entities/editor/editing_circle.json", {terrain: this._terrain}, "Default");
	this._camSpeed = 100;
	this._border = 0.75;
	this._lookAt = Vector3D.construct(64, 10, 64);
	this._radius = 5;

	this._textures = [
		{diffuse: "textures/grass.png", normal: "textures/grass_normal.png"},
		{diffuse: "textures/cracked_floor.png", normal: "textures/cracked_floor_normal.png"},
		{diffuse: "textures/rock.png", normal: "textures/rock_normal.png"}
	]

	this._currentTexture = 0;

	this._zoom = 32;
	this._angle = {
		elevation: 0.5,
		azimuth: 0
	}
}

_.inherit(Editor, Entity);

_.extend(Editor.prototype, {
	updateCamera: function(dt)
	{
		this._angle.elevation = Math.max(0.1, this._angle.elevation);
		this._angle.elevation = Math.min(Math.PI / 2, this._angle.elevation);

		this._zoom = Math.max(this._zoom, 1);

		var e = this._angle.elevation;
		var z = this._zoom;

		var x = this._lookAt.x + (z * Math.sin(e) * Math.sin(this._angle.azimuth));
		var y = this._lookAt.y + (z * Math.cos(e));
		var z = this._lookAt.z + (-z * Math.sin(e) * Math.cos(this._angle.azimuth));

		Game.camera.setTranslation(x, y, z);

		var t = Game.camera.translation();
		var r = Vector3D.lookAt(t, this._lookAt);

		Game.camera.setRotation(r.x, r.y, 0);

		t = Game.time();

		if (Mouse.wheelDown())
		{
			this._zoom += 3;
		}
		else if (Mouse.wheelUp())
		{
			this._zoom -= 3;
		}

		if (Mouse.isDown(MouseButton.Middle))
		{
			var movement = Mouse.movement();
			this._angle.azimuth += movement.x / 100;
			this._angle.elevation -= movement.y / 100;
		}

		var speed = dt * this._camSpeed;

		var forward = {
			x: Math.cos(this._angle.azimuth + Math.PI / 2),
			z: Math.sin(this._angle.azimuth + Math.PI / 2)
		}

		var strafe = {
			x: Math.cos(this._angle.azimuth),
			z: Math.sin(this._angle.azimuth)
		}

		var forwardBack = {
			x: 0,
			z: 0
		}

		var leftRight = {
			x: 0,
			z: 0
		}

		if (Keyboard.isDown(Key.W))
		{
			forwardBack.x = forward.x * speed;
			forwardBack.z = forward.z * speed;
		}
		else if (Keyboard.isDown(Key.S))
		{
			forwardBack.x = forward.x * -speed;
			forwardBack.z = forward.z * -speed;
		}

		if (Keyboard.isDown(Key.A))
		{
			leftRight.x = strafe.x * speed;
			leftRight.z = strafe.z * speed;
		}
		else if (Keyboard.isDown(Key.D))
		{
			leftRight.x = strafe.x * -speed;
			leftRight.z = strafe.z * -speed;
		}

		var p = Mouse.position(MousePosition.Screen);
		var ratio;
		var mag = 1;

		if (p.x < -this._border)
		{
			ratio = (this._border + p.x) * (1 / (1 - this._border)) * mag;
			leftRight.x = strafe.x * ratio * -speed;
			leftRight.z = strafe.z * ratio * -speed;
		}
		else if (p.x > this._border)
		{
			ratio = (this._border - p.x) * (1 / (1 - this._border)) * mag;
			leftRight.x = strafe.x * ratio * speed;
			leftRight.z = strafe.z * ratio * speed;
		}

		if (p.y < -this._border)
		{
			ratio = (this._border + p.y) * (1 / (1 - this._border)) * mag;
			forwardBack.x = forward.x * ratio * -speed;
			forwardBack.z = forward.z * ratio * -speed;
		}
		else if (p.y > this._border)
		{
			ratio = (this._border - p.y) * (1 / (1 - this._border)) * mag;
			forwardBack.x = forward.x * ratio * speed;
			forwardBack.z = forward.z * ratio * speed;
		}

		this._lookAt.x += leftRight.x + forwardBack.x;
		this._lookAt.z += leftRight.z + forwardBack.z;
	},

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

		if (Keyboard.isDown(Key.Q))
		{
			this._radius -= dt * 30;
		}
		else if (Keyboard.isDown(Key.E))
		{
			this._radius += dt * 30;
		}

		this._editingCircle._radius = this._radius / 2.0;

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
		if (Mouse.isReleased(MouseButton.Right) || Mouse.isDown(MouseButton.Left))
		{
			if (Keyboard.isDown(Key.Shift))
			{
				this._terrain.brushTexture("textures/brush.png", this._textures[this._currentTexture].diffuse, x2d, z2d, size, this._textures[this._currentTexture].normal);
				return;
			}
			
			for (var x = x2d - size / 2; x < x2d + size / 2; ++x)
			{
				for (var y = z2d - size / 2; y < z2d + size / 2; ++y)
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
					t = 1 - dist / (size / 2);

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
		this.updateCamera(dt);
		this.updateCircle(dt);
	}
});