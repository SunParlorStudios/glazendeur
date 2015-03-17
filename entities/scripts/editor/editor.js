var Editor = Editor || function(params)
{
	Editor._super.constructor.call(this, arguments);
	this._terrain = params.terrain;
	this._editingCircle = this.world().spawn("entities/editor/editing_circle.json", {terrain: this._terrain}, "Default");
	this._camSpeed = 200;
	this._border = 0.75;
	this._lookAt = Vector3D.construct(0, 0, 0);

	Game.camera.setTranslation(64, 64, 64);
}

_.inherit(Editor, Entity);

_.extend(Editor.prototype, {
	updateCamera: function(dt)
	{
		var t = Game.camera.translation();
		var r = Vector3D.lookAt(t, this._lookAt);

		Game.camera.setRotation(r.x, r.y, 0);

		t = Game.time();
	},

	updateCircle: function(dt)
	{
		var p = Mouse.position(MousePosition.Relative);
		p.x = (p.x + RenderSettings.resolution().w / 2);
		p.y = (p.y + RenderSettings.resolution().h / 2);

		var unprojA = Game.camera.unproject(p.x, p.y, Game.camera.nearPlane());
		var unprojB = Game.camera.unproject(p.x, p.y, Game.camera.farPlane());

		var f = unprojA.y / (unprojB.y - unprojA.y);
		var x2d = unprojA.x - f * (unprojB.x - unprojA.x);
		var z2d = unprojA.z - f * (unprojB.z - unprojA.z);

		this._editingCircle.setPosition(x2d, z2d);

		var size = 20;
		var dist;
		if (Mouse.isDown(MouseButton.Right))
		{
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

					var e = Math.easeInOutQuintic(t, 0, 20, 1);

					if (e < 0)
					{
						e = 0;
					}

					var h = this._terrain.getHeight(indices.x, indices.y);

					this._terrain.setHeight(indices.x, indices.y, h + e * dt);
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