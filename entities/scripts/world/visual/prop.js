var Prop = Prop || function(params)
{
	Prop._super.constructor.call(this, arguments);

	this._model = this._renderables[0];

	if (params.editMode == true)
	{
		this._editor = params.editor;
		this._gizmo = this.world().spawn("entities/editor/transform_gizmo.json", {editor: this._editor}, "UI");
		this._gizmo.attachTo(this._model);
		this._model.setBlend(0, 1, 0);
		this._gizmo.setActivated(false);
	}

	this.load({
		translation: params.translation,
		definition: params.definition
	});

	this.setActivated(false);
}

_.inherit(Prop, Entity);

_.extend(Prop.prototype, {
	onUpdate: function(dt)
	{
		var r = Vector3D.lookAt(this._model.translation(), Game.camera.translation());
		this._model.setRotation(r.x, r.y, r.z);
	},

	setPosition: function(x, y, z)
	{
		this._model.setTranslation(x, y, z);

		if (this._gizmo !== undefined)
		{
			this._gizmo.renderable(0).setTranslation(x, y, z);
		}
	},

	place: function(landscape)
	{
		this._gizmo.setActivated(true);
		this._model.setBlend(1, 1, 1);

		if (landscape !== undefined)
		{
			landscape.addProp(this);
			this._landscape = landscape;
		}
	},

	model: function()
	{
		return this._model;
	},

	remove: function()
	{
		this._gizmo.destroy();
		this.destroy();

		this._landscape.removeProp(this);
	},

	save: function()
	{
		var data = {};

		data.translation = this._model.translation();
		data.rotation = this._model.rotation();
		data.scale = this._model.scale();
		data.definition = this._definition;

		return data;
	},

	load: function(data)
	{
		this._definition = data.definition;

		this._model = this._renderables[0];
		this._model.setModel(this._definition.model);

		this._textures = this._definition.textures;

		this._model.setDiffuseMap(this._textures.diffuse);
		this._model.setNormalMap(this._textures.normal);
		this._model.setSpecularMap(this._textures.specular);

		if (data.translation !== undefined)
		{
			var t = data.translation;
			this._model.setTranslation(t.x, t.y, t.z);

			if (this._gizmo !== undefined)
			{
				this._gizmo.renderable(0).setTranslation(t.x, t.y, t.z);
			}
		}

		if (data.rotation !== undefined)
		{
			var r = data.rotation;
			this._model.setRotation(r.x, r.y, r.z);
		}

		if (data.scale !== undefined)
		{
			var s = data.scale;
			this._model.setScale(s.x, s.y, s.z);
		}
	}
});