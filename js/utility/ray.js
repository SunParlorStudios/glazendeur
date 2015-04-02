var Ray = Ray || function(t, d)
{
	this._origin = t;
	this._direction = d;
}

_.extend(Ray.prototype, {
	sphereIntersection: function(origin, radius)
	{
		var q = Vector3D.sub(origin, this._origin);
	   	var c = Vector3D.length(q);
	   	var v = Vector3D.dot(q, this._direction);
	   	var d = radius*radius - (c*c - v*v);

	   	if (d < 0.0) 
	   	{
	   		return false;
	   	}

	   	return true;
	}
});