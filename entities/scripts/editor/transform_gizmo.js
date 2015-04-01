var TransformGizmo = TransformGizmo || function(params)
{
	TransformGizmo._super.constructor.call(this, arguments);
	this._root = this._renderables[0];

	this._axis = {
		x: this._renderables[1],
		y: this._renderables[2],
		z: this._renderables[3]
	}

	this._axis.x.setBlend(1, 0, 0);
	this._axis.y.setBlend(0, 1, 0);
	this._axis.z.setBlend(0, 0, 1);
}

_.inherit(TransformGizmo, Entity);

_.extend(TransformGizmo.prototype, {
	setPosition: function(x, y, z)
	{
		this._root.setTranslation(x, y, z);
	},

	onUpdate: function()
	{

	}
});