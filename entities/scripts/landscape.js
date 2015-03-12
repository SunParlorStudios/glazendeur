var Landscape = Landscape || function(params)
{
	Landscape._super.constructor.call(this, arguments);
	this._terrain = this._renderables[0];
	this._light = new Light(LightType.Directional);
	this._light.setDirection(0, -1, 1);
}

_.inherit(Landscape, Entity);

_.extend(Landscape.prototype, {
	onUpdate: function(dt)
	{
		var p = Mouse.position(MousePosition.Relative);
		p.x = (p.x + RenderSettings.resolution().w / 2);
		p.y = (p.y + RenderSettings.resolution().h / 2);

		var unprojA = Game.camera.unproject(p.x, p.y, Game.camera.nearPlane());
		var unprojB = Game.camera.unproject(p.x, p.y, Game.camera.farPlane());

		Line.draw(unprojA.x, unprojA.y, unprojA.z, 1,0,0, unprojB.x, unprojB.y, unprojB.z, 1,0,0);
		
		var f = unprojA.y / (unprojB.y - unprojA.y);
		var x2d = unprojA.x - f * (unprojB.x - unprojA.x);
		var z2d = unprojA.z - f * (unprojB.z - unprojA.z);

		Line.draw(x2d - 2, -0.5, z2d - 2, 0, 0, 1, x2d + 2, -0.5, z2d + 2, 0, 0, 1);
		Line.draw(x2d + 2, -0.5, z2d - 2, 0, 0, 1, x2d - 2, -0.5, z2d + 2, 0, 0, 1);
	
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
	}
});