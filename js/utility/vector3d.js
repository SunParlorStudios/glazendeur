/**
 * Vector3D functionality container
 *
 * @public
 * @singleton module:Vector3D
 * @author Riko Ophorst
 */
var Vector3D = {};

_.extend(Vector3D, {
	/**
	 * constructs a Vector3D data container
	 *
	 * @public
	 * @method module:Vector3D#construct
	 * @param {number} x - x value
	 * @param {number} y - y value
	 * @param {number} z - z value
	 * @return {object} A Vector3D data container
	 * @author Riko Ophorst
	 */
	construct: function (x, y, z)
	{
		return {x:x, y:y, z:z};
	},

	/**
	 * Adds two vectors
	 *
	 * @public
	 * @method module:Vector3D#add
	 * @param {vector3d} v1 - a vector3d
	 * @param {vector3d} v2 - a vector3d
	 * @return {vector3d} A new Vector3D which is the result of v1+v2
	 * @author Riko Ophorst
	 */
	add: function (v1, v2)
	{
		return this.construct(v1.x + v2.x, v1.y + v2.y, v1.z + v2.z);
	},

	/**
	 * Subtracts two vectors
	 *
	 * @public
	 * @method module:Vector3D#sub
	 * @param {vector3d} v1 - a vector3d
	 * @param {vector3d} v2 - a vector3d
	 * @return {vector3d} A new Vector3D which is the result of v1-v2
	 * @author Riko Ophorst
	 */
	sub: function (v1, v2)
	{
		return this.construct(v1.x - v2.x, v1.y - v2.y, v1.z - v2.z);
	},

	/**
	 * Multiplies a vector3d with a scalar
	 *
	 * @public
	 * @method module:Vector3D#mul
	 * @param {vector3d} v1 - a vector3d
	 * @param {vector3d} v2 - a vector3d
	 * @return {vector3d} A new Vector3D which is the result of v1*v2
	 * @author Riko Ophorst
	 */
	mul: function (v, s)
	{
		return this.construct(v1.x * s, v1.y * s, v1.z * s);
	},

	/**
	 * Dot product of two vectors
	 *
	 * @public
	 * @method module:Vector3D#dot
	 * @param {vector3d} v1 - a vector3d
	 * @param {vector3d} v2 - a vector3d
	 * @return {vector3d} A new Vector3D which is the dot product of v1 & v2
	 * @author Riko Ophorst
	 */
	dot: function (v1, v2)
	{
		return this.construct(v1.x * v2.x, v1.y * v2.y, v1.z * v2.z);
	},

	/**
	 * Cross product of two vectors
	 *
	 * @public
	 * @method module:Vector3D#cross
	 * @param {vector3d} v1 - a vector3d
	 * @param {vector3d} v2 - a vector3d
	 * @return {vector3d} A new Vector3D which is the cross product of v1 & v2
	 * @author Riko Ophorst
	 */
	cross: function (v1, v2)
	{
		return this.construct(
			v1.y * v2.z - v1.z * v2.y, 
			v1.z * v2.x - v1.x * v2.z,
			v1.x * v2.y - v1.y * v2.x
		);
	},

	/**
	 * Calculates the length of a vector3d
	 *
	 * @public
	 * @method module:Vector3D#length
	 * @param {vector3d} v - a vector3d
	 * @return {number} The length of the vector3d
	 * @author Riko Ophorst
	 */
	length: function (v)
	{
		return Math.sqrt(v.x * v.x, v.y * v.y, v.z * v.z);
	},

	/**
	 * Normalises a vector3d
	 *
	 * @public
	 * @method module:Vector3D#normalise
	 * @param {vector3d} v - a vector3d
	 * @return {vector3d} A new Vector3D which is the normalised vector of given vector3d
	 * @author Riko Ophorst
	 */
	normalise: function (v)
	{
		var l = this.length(v);
		return this.construct(v.x / l, v.y / l, v.z / l);
	},

	lookAt: function(v1, v2)
	{
		var dx = v2.x - v1.x;
		var dy = v2.y - v1.y;
		var dz = v2.z - v1.z;

		var distance = Math.sqrt(dx * dx + dz * dz);
		
		var rx = -Math.atan2(dy, distance);
		var ry = Math.atan2(dx, dz);
		var rz = 0;

		return {x: rx, y: Math.PI + ry, z: rz}
	}
});