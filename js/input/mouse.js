
_.extend(Mouse, {
	getTerrainPosition: function (camera, landscapes)
	{
		var ray = camera.projectRay();
		var intersection = false;
		var lowest, found = undefined;
		var landscape;

		for (var i = 0; i < landscapes.length; ++i)
		{
			landscape = landscapes[i];
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

		return Ray.getIntersectionPoint(ray, lowest);
	}
});