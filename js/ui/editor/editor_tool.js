var EditorTool = EditorTool || function(root, editor, type, layer)
{
	EditorTool._super.constructor.call(this, root);

	this._editor = editor;
	this._type = type;
	this._layer = layer || "UI";

	this._path = "textures/editor/widgets/";
	this._toolTextures = [
		{ default: this._path + "tools/raise.png", hover: this._path + "tools/raise_hover.png", pressed: this._path + "tools/raise_pressed.png" },
		{ default: this._path + "tools/paint.png", hover: this._path + "tools/paint_hover.png", pressed: this._path + "tools/paint_pressed.png" },
		{ default: this._path + "tools/smooth.png", hover: this._path + "tools/smooth_hover.png", pressed: this._path + "tools/smooth_pressed.png" }
	]

	this.initialise();
}

_.inherit(EditorTool, Button);

_.extend(EditorTool.prototype, {
	initialise: function()
	{
		this.onReleased.ctx = this;
		this.setOnReleased(this.onReleased);
	},

	setUI: function()
	{
		var tex = this._toolTextures[this._type];

		this.setDiffuseMap(tex.default);
		this.setTextures(tex.default, tex.hover, tex.pressed);
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
		this._editor.setTool(this._type);
	}
});