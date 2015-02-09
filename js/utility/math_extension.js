// Easing functions from: http://www.timotheegroleau.com/Flash/experiments/easing_function_generator.htm

/// Lerps from one value to another
Math.lerp = function(a, b, ratio)
{
	return a + (b-a) * ratio;
}

/// Eases elastic out
Math.easeOutElastic = function(t, b, c, d) 
{
	var ts=(t/=d)*t;
	var tc=ts*t;
	return b+c*(33*tc*ts + -106*ts*ts + 126*tc + -67*ts + 15*t);
}

/// Eases quadratic in
Math.easeInQuadratic = function(t, b, c, d)
{
	t /= d;
	return b+c*(t*t);
}

/// Eases quadratic in
Math.easeOutQuadratic = function(t, b, c, d)
{
	t /= d;
	return b - c*(t*(t-2));
}

/// Converts an easing function to an interpolation
Math.easeToInterpolation = function(a, b, e)
{
	return a * (1-e) + b * e;
}

/// Returns the distance between 2 points
Math.distance = function(x1,y1,x2,y2)
{
	var dx = x2 - x1;
	var dy = y2 - y1;

	return Math.sqrt(dx*dx + dy*dy);
}

/// Returns a number within a range
Math.randomRange = function(a,b)
{
	return a + (b-a)*Math.random();
}

/// Returns a shake on x and y coordinates
Math.shake = function(magnitude,timer)
{
	var random = {x: Math.randomRange(-1,1), y: Math.randomRange(-1,1) }
	random.x *= magnitude;
	random.y *= magnitude;

	return {x: (1-timer) * random.x, y: (1-timer) * random.y }
}