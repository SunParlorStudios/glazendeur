/**
 * Can draw geometry trough debug line drawing
 *
 * @public
 * @singleton module:Geometry
 */
var Geometry = {};

_.extend(Geometry, {
	/**
	 * Draws a rectangle
	 *
	 * @public
	 * @method module:Geometry#drawRectangle
	 * @param {number} x1 - x position of the top left coordinate
	 * @param {number} y1 - y position of the top left coordinate
	 * @param {number} x2 - x position of the bottom right coordinate
	 * @param {number} y2 - y position of the bottom right coordinate
	 * @param {number} z - z position of the rectangle
	 * @param {number} r - red color value of the top left coordinate
	 * @param {number} g - green color value of the top left coordinate
	 * @param {number} b - blue color value of the top left coordinate
	 * @param {number} rr - red color value of the bottom right coordinate
	 * @param {number} gg - green color value of the bottom right coordinate
	 * @param {number} bb - blue color value of the bottom right coordinate
	 */
	drawRectangle: function (x1, y1, x2, y2, z, r, g, b, rr, gg, bb)
	{
		if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined)
		{
			Log.error("Cannot draw a rectangle, not all required parameters were set! (x1, y1, x2, y2)");
			return;
		}

		var zz = z === undefined ? 1 : z;

		var r1 = r === undefined ? 1 : r;
		var g1 = g === undefined ? 1 : g;
		var b1 = b === undefined ? 1 : b;

		var r2 = rr === undefined ? r1 : rr;
		var g2 = gg === undefined ? g1 : gg;
		var b2 = bb === undefined ? b1 : bb;

		Line.draw(x1, y1, zz, r1, g1, b1, x2, y1, zz, r2, g2, b2);
		Line.draw(x2, y1, zz, r1, g1, b1, x2, y2, zz, r2, g2, b2);
		Line.draw(x1, y2, zz, r1, g1, b1, x2, y2, zz, r2, g2, b2);
		Line.draw(x1, y1, zz, r1, g1, b1, x1, y2, zz, r2, g2, b2);
	}
});