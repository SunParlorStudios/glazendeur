var View = View || function ()
{

};

_.extend(View.prototype, {
	overwrite: false,
	override: false
}, {
	__elements: [],
	__initialized: false,
	GetResourceList: function ()
	{
		return ViewCreator.getResourceList(this.__elements);
	},
	Spawn: function ()
	{
		if (!this.__initialized)
		{
			ViewCreator.initializeChildren(this, this.__elements);
		}

		var loopChildren = function (object) {
			for (var key in object)
			{
				var child = object[key];
				if (child.___ISANOBJECT___ === true)
				{
					if (child.visible == true)
					{
						child.spawn('UI');

						if (child.setActivated)
						{
							child.setActivated(true);
						}
					}

					loopChildren(child);
				}
			}
		};

		loopChildren(this);

	},
	Leave: function ()
	{
		var loopChildren = function (object)
		{
			for (var key in object)
			{
				var child = object[key];
				if (child.___ISANOBJECT___ === true)
				{
					child.destroy();

					if (child.setActivated)
					{
						child.setActivated(false);
					}

					loopChildren(child);
				}
			}
		}

		loopChildren(this);
	},
	AddComponent: function ()
	{

	}
});