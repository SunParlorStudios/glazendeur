/**
 * Vector2D functionality container
 *
 * @public
 * @singleton module:Vector2D
 * @author Riko Ophorst
 */
var Vector2D = {};

_.extend(Vector2D, {
	/**
	 * constructs a Vector2D data container
	 *
	 * @public
	 * @method module:Vector2D#construct
	 * @param {number} x - x value
	 * @param {number} y - y value
	 * @return {object} A Vector2D data container
	 * @author Riko Ophorst
	 */
	construct: function (x, y)
	{
		return {x:x, y:y};
	},

	/**
	 * Adds two vectors
	 *
	 * @public
	 * @method module:Vector2D#add
	 * @param {vector2d} v1 - a vector2d
	 * @param {vector2d} v2 - a vector2d
	 * @return {vector2d} A new Vector2D which is the result of v1+v2
	 * @author Riko Ophorst
	 */
	add: function (v1, v2)
	{
		return this.construct(v1.x + v2.x, v1.y + v2.y);
	},

	/**
	 * Subtracts two vectors
	 *
	 * @public
	 * @method module:Vector2D#sub
	 * @param {vector2d} v1 - a vector2d
	 * @param {vector2d} v2 - a vector2d
	 * @return {vector2d} A new Vector2D which is the result of v1-v2
	 * @author Riko Ophorst
	 */
	sub: function (v1, v2)
	{
		return this.construct(v1.x - v2.x, v1.y - v2.y);
	},

	/**
	 * Multiplies two vectors
	 *
	 * @public
	 * @method module:Vector2D#mul
	 * @param {vector2d} v1 - a vector2d
	 * @param {vector2d} v2 - a vector2d
	 * @return {vector2d} A new Vector2D which is the result of v1*v2
	 * @author Riko Ophorst
	 */
	mul: function (v1, v2)
	{
		return this.construct(v1.x * v2.x, v1.y * v2.y);
	},

	/**
	 * Divides two vectors
	 *
	 * @public
	 * @method module:Vector2D#div
	 * @param {vector2d} v1 - a vector2d
	 * @param {vector2d} v2 - a vector2d
	 * @return {vector2d} A new Vector2D which is the result of v1/v2
	 * @author Riko Ophorst
	 */
	div: function (v1, v2)
	{
		return this.construct(v1.x / v2.x, v1.y / v2.y);
	},

	/**
	 * Dot product of two vectors
	 *
	 * @public
	 * @method module:Vector2D#sub
	 * @param {vector2d} v1 - a vector2d
	 * @param {vector2d} v2 - a vector2d
	 * @return {number} A number which is the dot product of v1 & v2
	 * @author Riko Ophorst
	 */
	dot: function (v1, v2)
	{
		return (v1.x * v2.x) + (v1.y * v2.y);
	},

	/**
	 * Length of a vector2d
	 *
	 * @public
	 * @method module:Vector2D#length
	 * @param {vector2d} v - a vector2d
	 * @return {number} The length of given vector2d
	 * @author Riko Ophorst
	 */
	length: function(v)
	{
		return Math.sqrt(v.x * v.x + v.y * v.y);
	},

	/**
	 * Normalises a vector
	 *
	 * @public
	 * @method module:Vector2D#normalise
	 * @param {vector2d} v - a vector2d
	 * @return {vector2d} A new normalised vector2d of given vector
	 * @author Riko Ophorst
	 */
	normalise: function (v)
	{
		var l = this.length(v);
		return this.construct(v.x / l, v.y / l); 
	},

	/**
	 * Projects two vectors
	 *
	 * @public
	 * @method module:Vector2D#project
	 * @param {vector2d} v1 - a vector2d
	 * @param {vector2d} v2 - a vector2d
	 * @return {vector2d} A new projection vector2d of given vectors
	 * @author Riko Ophorst
	 */
	project: function (v1, v2)
	{
		var d = this.dot(v1, v2),
			x = v2.x,
			y = v2.y,
			v = x * x + y * y;
		return this.construct(d / v * x, d / v * y);
	},

	/**
	 * Calculates the right hand normal of a vector2d
	 *
	 * @public
	 * @method module:Vector3D#rightHandNormal
	 * @param {vector2d} v - a vector2d
	 * @return {vector2d} the right hand normal of the given vector2d
	 * @author Riko Ophorst
	 */
	rightHandNormal: function (v)
	{
		return this.construct(-v.y, v.x);
	},

	/**
	 * Calculates the left hand normal of a vector2d
	 *
	 * @public
	 * @method module:Vector3D#leftHandNormal
	 * @param {vector2d} v - a vector2d
	 * @return {vector2d} the left hand normal of the given vector2d
	 * @author Riko Ophorst
	 */
	leftHandNormal: function (v)
	{
		return this.construct(v.y, -v.x);
	}
});