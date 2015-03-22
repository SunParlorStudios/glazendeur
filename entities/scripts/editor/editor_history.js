var HistoryPoint = HistoryPoint || function(terrain)
{
	this._terrain = terrain;
	this._heights = [];
	this.create();
}

_.extend(HistoryPoint.prototype, {
	create: function()
	{
		for (var y = 0; y < this._terrain.height(); ++y)
		{
			for (var x = 0; x < this._terrain.width(); ++x)
			{
				this._heights.push(this._terrain.getHeight(x, y));
			}
		}
	},

	apply: function()
	{
		for (var y = 0; y < this._terrain.height(); ++y)
		{
			for (var x = 0; x < this._terrain.width(); ++x)
			{
				this._terrain.setHeight(x, y, this._heights[y * this._terrain.width() + x]);
			}
		}

		this._terrain.flush();
	}
});


var EditorHistory = EditorHistory || function(terrain)
{
	this._terrain = terrain;
	this._historyIndex = 0;
	this._history = [];
}

_.extend(EditorHistory.prototype, {
	addPoint: function(point)
	{
		this._history.push(point);
		++this._historyIndex;

		while (this._history.length > this._historyIndex)
		{
			this._history.pop();
		}
	},

	undo: function()
	{
		if (this._historyIndex == this._history.length && this._history.length > 0)
		{
			this._history.push(new HistoryPoint(this._terrain));
			--this._historyIndex;
		}

		if (this._historyIndex > 0)
		{
			this._history[--this._historyIndex].apply();
		}
	},

	redo: function()
	{
		if (this._historyIndex < this._history.length - 1)
		{
			this._history[++this._historyIndex].apply();

			if (this._historyIndex == this._history.length - 1)
			{
				--this._historyIndex;
			}
		}
	}
});