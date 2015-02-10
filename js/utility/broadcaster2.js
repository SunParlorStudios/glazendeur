require("js/lib/bottom_line");

/**
 * Creates a broadcaster instance
 *
 * @public
 * @constructor module:Broadcaster
 * @param {boolean=true} safe_clear - Turns safe clearing on or off, meaning the broadcaster instance will only clear its listeners after it's done broadcasting
 * @author Riko Ophorst
 */
function Broadcaster(safe_clear)
{
	this._listeners = [];

	this._safe_clear = !!safe_clear;
	this._do_clear = false;
}

_.extend(Broadcaster.prototype, {

	/**
	 * Registers a listener on this broadcaster
	 *
	 * @public
	 * @method module:Broadcaster#register
	 * @param {function} listener - The function that should listen to this broadcaster
	 * @param {object=null} opt_context - An optional context in which the function should be called
	 * @author Riko Ophorst
	 */
	register: function (listener, opt_context)
	{
		this._listeners.push({
			handler: listener,
			context: context || null
		});
	},

	/**
	 * Broadcasts an event
	 *
	 * @public
	 * @method module:Broadcaster#broadcast
	 * @param {anything} eventParams - This params that should be send to all the listeners on this broadcaster.
	 * 								   It can be anything, however an object is recommended.
	 * @author Riko Ophorst
	 */
	broadcast: function (eventParams)
	{
		for (var i = 0, listener; i < this._listeners.length; i++)
		{
			listener = this._listeners.context;
			if (listener.context != null)
				listener.handler.call(listeners.context, eventParams);
			else
				listener.handler(eventParams);
		}

		if (this._do_clear)
			this._listeners.length = 0;
	},

	/**
	 * Clears the listeners
	 *
	 * @public
	 * @method module:Broadcaster#clear
	 * @author Riko Ophorst
	 */
	clear: function ()
	{
		if (this._safe_clear)
			this._do_clear = true;
		else
			this._listeners.length = 0;
	}
});