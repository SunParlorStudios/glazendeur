var Landscape = Landscape || function(params)
{
	Landscape._super.constructor.call(this, arguments);
	this._terrain = this._renderables[0];
	this._terrain.setShader("shaders/terrain.fx");
}

_.inherit(Landscape, Entity);

_.extend(Landscape.prototype, {
	onUpdate: function(dt)
	{
		var p = Mouse.position(Mouse.Relative);
		p.x = (p.x + RenderSettings.resolution().w / 2);
		p.y = (p.y + RenderSettings.resolution().h / 2);

		var unprojA = Game.camera.unprojectNear(p.x, p.y);
		var unprojB = Game.camera.unprojectFar(p.x, p.y);

		Line.draw(unprojA.x, unprojA.y, unprojA.z, 1,0,0, unprojB.x, unprojB.y, unprojB.z, 1,0,0);
		
		var f = unprojA.y / (unprojB.y - unprojA.y);
		var x2d = unprojA.x - f * (unprojB.x - unprojA.x);
		var z2d = unprojA.z - f * (unprojB.z - unprojA.z);

		Line.draw(x2d - 2, -0.5, z2d - 2, 0, 0, 1, x2d + 2, -0.5, z2d + 2, 0, 0, 1);
		Line.draw(x2d + 2, -0.5, z2d - 2, 0, 0, 1, x2d - 2, -0.5, z2d + 2, 0, 0, 1);
	
		var size = 20;
		var dist;
		if (Mouse.isDown(1))
		{
			for (var x = Math.floor(x2d) - size / 2; x < Math.floor(x2d) + size / 2; ++x)
			{
				for (var y = Math.floor(z2d) - size / 2; y < Math.floor(z2d) + size / 2; ++y)
				{
					dist = Math.distance(x, y, Math.floor(x2d), Math.floor(z2d));

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
					var h = this._terrain.getHeight(x, y);

					this._terrain.setHeight(x, y, h + e * dt);
				}
			}

			this._terrain.recreate();
		}
	}
});