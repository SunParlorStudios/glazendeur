/**
 * Extends the Math object
 *
 * @singleton
 * @extends Math
 * @author Riko Ophorst
 */
_.extend(Math, {
	/**
	 * Linear interpolation
	 * 
	 * @public
	 * @method module:Math#lerp
	 * @param {number} a - first value
	 * @param {number} b - second value
	 * @param {number} ratio - a point in time between 0 - 1
	 * @return {number} An eased number
	 */
	lerp: function(a, b, ratio)
	{
		return a + (b-a) * ratio;
	},
	/**
	 * Eases elastic out
	 * 
	 * @public
	 * @method module:Math#easeOutElastic
	 * @param {number} t - time
	 * @param {number} b - first value
	 * @param {number} c - second value
	 * @param {number} d - division
	 * @return {number} An eased number
	 */
	easeOutElastic: function(t, b, c, d) 
	{
		var ts=(t/=d)*t;
		var tc=ts*t;
		return b+c*(33*tc*ts + -106*ts*ts + 126*tc + -67*ts + 15*t);
	},

	/**
	 * Eases quadratically in
	 * 
	 * @public
	 * @method module:Math#easeInQuadratic
	 * @param {number} t - time
	 * @param {number} b - first value
	 * @param {number} c - second value
	 * @param {number} d - division
	 * @return {number} An eased number
	 */
	easeInQuadratic: function(t, b, c, d)
	{
		t /= d;
		return b+c*(t*t);
	},

	/**
	 * Eases quadratically out
	 * 
	 * @public
	 * @method module:Math#easeOutQuadratic
	 * @param {number} t - time
	 * @param {number} b - first value
	 * @param {number} c - second value
	 * @param {number} d - division
	 * @return {number} An eased number
	 */
	easeOutQuadratic: function(t, b, c, d)
	{
		t /= d;
		return b - c*(t*(t-2));
	},

	/**
	 * Calculates distance
	 * 
	 * @public
	 * @method module:Math#distance
	 * @param {number} x1 - x position of first object
	 * @param {number} y1 - y position of first object
	 * @param {number} x2 - x position of second object
	 * @param {number} y2 - y position of second object
	 * @return {number} The distance between the points
	 */
	distance: function(x1,y1,x2,y2)
	{
		var dx = x2 - x1;
		var dy = y2 - y1;

		return Math.sqrt(dx*dx + dy*dy);
	},

	/**
	 * Calculates a random number between two numbers
	 * 
	 * @public
	 * @method module:Math#randomRange
	 * @param {number} a - first value
	 * @param {number} b - second value
	 * @return {number} A random number between the two given parameters
	 */
	randomRange: function(a,b)
	{
		return a + (b-a)*Math.random();
	},

	/**
	 * Calculates a custom shake
	 * 
	 * @public
	 * @method module:Math#shake
	 * @param {number} magnitude - strength of the shake
	 * @param {number} timer - a point in time between 0 - 1
	 * @return {object} An object with x&y values of a shake
	 * @author Daniel Konings
	 */
	shake: function(magnitude,timer)
	{
		var random = {x: Math.randomRange(-1,1), y: Math.randomRange(-1,1) }
		random.x *= magnitude;
		random.y *= magnitude;

		return {x: (1-timer) * random.x, y: (1-timer) * random.y }
	}
});