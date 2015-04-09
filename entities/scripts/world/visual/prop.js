var Prop = Prop || function(params)
{
	Prop._super.constructor.call(this, arguments);
	this._model = this._renderables[0];
	this._textures = params.textures;

	this._model.setModel(params.model);
	this._model.setDiffuseMap(this._textures.diffuse);
	this._model.setNormalMap(this._textures.normal);
	this._model.setSpecularMap(this._textures.specular);

	if (params.editMode == true)
	{
		this._editor = params.editor;
		this._gizmo = this.world().spawn("entities/editor/transform_gizmo.json", {editor: this._editor}, "UI");
		this._gizmo.attachTo(this._model);
	}

	this.setActivated(false);
	this._model.setScale(0.5, 0.5, 0.5);
	this._model.setTranslation(160, 4.5, 168);
	debugModel = this;
}

_.inherit(Prop, Entity)

_.extend(Prop.prototype, {
	onUpdate: function(dt)
	{

	}
})