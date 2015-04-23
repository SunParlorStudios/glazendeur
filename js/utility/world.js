require("js/utility/entity");

function World()
{
	this._entities = [];

	this._fields = {
		scale: 3, 
		offset: 3, 
		texture: 1
	};
}

_.extend(World.prototype, {
	spawn: function(entityPath, params, layer)
	{
		var description = JSON.load(entityPath, entityPath);
		if (description.script === undefined || description.script.object === undefined || description.script.path === undefined)
		{
			assert(false, "'" + entityPath + "' doesn't have a script assigned to it");
		}
		require(description.script.path);

		var toRender = description.renderables;
		var constructor = _GLOBAL_[description.script.object];

		var renderable;
		var renderables = [];
		var func;
		var argc;
		var argv = [];
		var fields;
		var parent;

		if (toRender !== undefined)
		{
			for (var i = 0; i < toRender.length; ++i)
			{
				argv = [];
				renderable = toRender[i];

				if (_GLOBAL_[renderable.type] === undefined || renderable.type === undefined)
				{
					Log.error("Unknown renderable type " + renderable.type + ", for entity '" + entityPath + "'");
					continue;
				}

				fields = renderable;
				if (renderable.type === "Model")
				{
					renderable = new Model(renderable.path, parent);
				}
				else
				{
					renderable = new _GLOBAL_[renderable.type](parent);
				}

				if (layer === undefined)
				{
					Log.warning("Could not spawn entity '" + entityPath + "' because it has no layer defined");
				}
				else
				{
					renderable.spawn(layer);
				}

				for (var field in this._fields)
				{
					if (fields[field] !== undefined)
					{
						argc = this._fields[field];
						for (var arg = 0; arg < argc; ++arg)
						{
							argv.push(fields[field][arg]);
						}
						func = "set" + field.charAt(0).toUpperCase() + field.substr(1, field.length - 1);

						renderable[func].apply(renderable, argv);
					}
				}

				renderables.push(renderable);

				if (parent === undefined)
				{
					parent = renderable;
				}
			}
		}
		
		assert(constructor.prototype.onUpdate !== undefined, "'" + entityPath + "' doesn't have an onUpdate function");

		var entity = new constructor(params, renderables, this);

		this._entities.push(entity);
		constructor.prototype._renderables = null;
		return entity;
	},

	update: function(dt)
	{
		var entity = undefined;
		for (var i = this._entities.length - 1; i >= 0; --i)
		{
			entity = this._entities[i];

			if (entity.active() == false)
			{
				continue;
			}

			entity.onUpdate(dt);
		}
	},

	destroy: function ()
	{
		for (var i = this._entities.length - 1; i >= 0; --i)
		{
			this._entities[i].destroy();
		}

		this._entities = [];
	}
});