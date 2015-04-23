/**
 * Ray casting functionality container
 *
 * @public
 * @singleton module:Ray
 * @author Daniël Konings
 */
var Ray = {};

_.extend(Ray, {
	/**
	 * constructs a Ray data container
	 *
	 * @public
	 * @method module:Ray#construct
	 * @param {object} o - The origin of the ray represented as a Vector3D
	 * @param {object} d - The direction of the ray represented as a Vector3D
	 * @return {object} A Ray data container
	 * @author Daniël Konings
	 */
	construct: function(o, d)
	{
		return {
			origin: o,
			direction: d
		};
	},

	/**
	 * Does an intersection check with a 3D sphere
	 *
	 * @public
	 * @method module:Ray#sphereIntersection
	 * @param {object} ray - The ray to check the intersection for
	 * @param {object} o - The origin of the sphere represented as a Vector3D
	 * @param {number} r - The radius of the sphere
	 * @return {bool} False if no intersection was found, otherwise true
	 * @author Daniël Konings
	 */
	sphereIntersection: function(ray, o, r)
	{
		var q = Vector3D.sub(o, ray.origin);
	   	var c = Vector3D.length(q);
	   	var v = Vector3D.dot(q, ray.direction);
	   	var d = r*r - (c*c - v*v);

	   	if (d < 0.0) 
	   	{
	   		return false;
	   	}

	   	return d;
	},

	getIntersectionPoint: function(ray, d)
	{
		return {
			x: ray.origin.x + ray.direction.x * d, 
			y: ray.origin.y + ray.direction.y * d,
			z: ray.origin.z + ray.direction.z * d
		};
	}
});