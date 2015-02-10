require("js/lib/bottom_line");

var _GLOBAL_ = this;

/**
 * Creates an enumerator instance
 *
 * @public
 * @constructor module:Enumerator
 * @param {string} name - the key under which the enumerator is accessible
 * @param {array} enumerations - all keys which should be available
 * @param {object} opt_context - a context in which the enumerator should be placed
 * @author Riko Ophorst
 */
function Enum(name, enumerations, opt_context)
{
	var opt_context = opt_context || {};

	_GLOBAL_[name] = {};
	opt_context[name] = {};

	for (var i = 0; i < enumerations.length; i++)
	{
		_GLOBAL_[name][enumerations[i]] = i;
		opt_context[name][enumerations[i]] = i;
	}
}