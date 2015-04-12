var CameraControl = CameraControl || function(params)
{
	CameraControl._super.constructor.call(this, arguments);

	this._editMode = params.editMode;

	this._speed = {
		movement: 100,
		angle: 3,
		zoom: 150,
		sensitivity: 100
	}

	this._border = 0.95;
	this._lookAt = Vector3D.construct(64, 10, 64);
	this._zoom = 32;

	this._angle = {
		elevation: 35 * Math.PI / 180,
		azimuth: 135 * Math.PI / 180
	}

	this._camera = params.camera;
	this._camera.setNearPlane(1);
	this._camera.setFarPlane(300);
}

_.inherit(CameraControl, Entity);

_.extend(CameraControl.prototype, {
	mouseToWorld: function()
	{
		var p = Mouse.position(MousePosition.Relative);
		p.x = (p.x + RenderSettings.resolution().w / 2);
		p.y = (p.y + RenderSettings.resolution().h / 2);

		var unprojA = this._camera.unproject(p.x, p.y, this._camera.nearPlane());
		var unprojB = this._camera.unproject(p.x, p.y, this._camera.farPlane());

		var f = unprojA.y / (unprojB.y - unprojA.y);
		return {
			x: unprojA.x - f * (unprojB.x - unprojA.x),
			y: 0,
			z: unprojA.z - f * (unprojB.z - unprojA.z)
		}
	},

	projectRay: function()
	{
		var p = Mouse.position(MousePosition.Relative);
		p.x = (p.x + RenderSettings.resolution().w / 2);
		p.y = (p.y + RenderSettings.resolution().h / 2);

		var unprojA = this._camera.unproject(p.x, p.y, 0);
		var unprojB = this._camera.unproject(p.x, p.y, 1);

		dir = Vector3D.normalise(Vector3D.sub(unprojB, unprojA));

		return Ray.construct(unprojA, dir);
	},

	onUpdate: function(dt)
	{
		if (Keyboard.isDown(Key.Control))
		{
			return;
		}
		
		this._angle.elevation = Math.max(0.1, this._angle.elevation);
		this._angle.elevation = Math.min(Math.PI / 2, this._angle.elevation);

		this._zoom = Math.max(this._zoom, 1);

		var e = this._angle.elevation;
		var z = this._zoom;

		var x = this._lookAt.x + (z * Math.sin(e) * Math.sin(this._angle.azimuth));
		var y = this._lookAt.y + (z * Math.cos(e));
		var z = this._lookAt.z + (-z * Math.sin(e) * Math.cos(this._angle.azimuth));

		this._camera.setTranslation(x, y, z);

		var t = this._camera.translation();
		var r = Vector3D.lookAt(t, this._lookAt);

		this._camera.setRotation(r.x, r.y, 0);
		var speed = this._speed.zoom * dt;

		if (Mouse.wheelDown())
		{
			this._zoom += speed;
		}
		else if (Mouse.wheelUp())
		{
			this._zoom -= speed;
		}

		if (Keyboard.isDown(Key.Plus))
		{
			this._zoom -= speed;
		}
		else if (Keyboard.isDown(Key.Minus))
		{
			this._zoom += speed;
		}

		if (Mouse.isDown(MouseButton.Middle))
		{
			var movement = Mouse.movement();
			this._angle.azimuth += movement.x / this._speed.sensitivity;
			this._angle.elevation -= movement.y / this._speed.sensitivity;
		}

		speed = this._speed.angle * dt;

		if (Keyboard.isDown(Key.Q))
		{
			this._angle.azimuth += speed;
		}
		else if (Keyboard.isDown(Key.E))
		{
			this._angle.azimuth -= speed;
		}

		if (Keyboard.isDown(Key.R))
		{
			this._angle.elevation -= speed;
		}
		else if (Keyboard.isDown(Key.F))
		{
			this._angle.elevation += speed;
		}

		speed = dt * this._speed.movement;

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
	}
});