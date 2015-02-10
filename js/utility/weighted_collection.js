require("js/lib/bottom_line");

/**
 * Has functionality for weighted collections
 *
 * @public
 * @singleton module:WeightedCollection
 * @author Riko Ophorst
 */
var WeightedCollection = WeightedCollection || {};

_.extend(WeightedCollection, {
	/**
	 * Retrieves a random item from a tuple array
	 *
	 * @public
	 * @method module:WeightedCollection#retrieve
	 * @param {array} tupleArray - A tuple array 
	 * @author Daniel Konings
	 */
	retrieve: function(tupleArray)
	{
		var final = [];

		for (var i = 0; i < tupleArray.length; ++i)
		{
			var tuple = tupleArray[i];
			for (var j = 0; j < tuple[1]; ++j)
			{
				final.push(tuple[0]);
			}
		}

		return final[Math.floor(Math.random()*final.length)];
	},

	/**
	 * Retrieves a random tuple from a tuple array
	 *
	 * @public
	 * @method module:WeightedCollection#retrieveAsTuple
	 * @param {array} tupleArray - A tuple array 
	 * @author Daniel Konings
	 */
	retrieveAsTuple: function(tupleArray)
	{
		var final = [];

		for (var i = 0; i < tupleArray.length; ++i)
		{
			var tuple = tupleArray[i];
			for (var j = 0; j < tuple[1]; ++j)
			{
				final.push(tuple);
			}
		}

		return final[Math.floor(Math.random()*final.length)];
	}
});