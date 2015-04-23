var EditorTool = EditorTool || function(root, editor, type, layer)
{
	EditorTool._super.constructor.call(this, root);

	this._editor = editor;
	this._type = type;
	this._layer = layer || "UI";

	this._path = "textures/editor/widgets/";
	this._toolTextures = [
		this._path + "tools/raise.png",
		this._path + "tools/paint.png",
		this._path + "tools/smooth.png",
		this._path + "tools/ramp.png",
		this._path + "tools/flatten.png"
	];

	this._hover = {
		r: 1,
		g: 1,
		b: 0
	};

	this._pressed = {
		r: 0.3,
		g: 0.3,
		b: 0.3
	};

	this.initialise();
};

_.inherit(EditorTool, Button);

_.extend(EditorTool.prototype, {
	initialise: function()
	{
		this.setOnReleased(this.onReleased, this);
		this.setOnEnter(this.onEnter, this);
		this.setOnLeave(this.onLeave, this);
	},

	setUI: function()
	{
		var tex = this._toolTextures[this._type];

		this.setDiffuseMap(tex.default);
		this.setTextures(tex.default);
		this.spawn(this._layer);
	},

	show: function()
	{

	},

	hide: function()
	{

	},

	onReleased: function()
	{
		this.setBlend(1, 1, 1);
		this._editor.setTool(this._type);
	},

	onEnter: function()
	{
		this.setBlend(this._hover.r, this._hover.g, this._hover.b);
	},

	onLeave: function()
	{
		this.setBlend(1, 1, 1);
	},

	onPressed: function()
	{
		this.setBlend(this._pressed.r, this._pressed.g, this._pressed.b);
	}
});