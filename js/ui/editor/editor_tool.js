var EditorTool = EditorTool || function(root, editor, editorUI, type, layer)
{
	EditorTool._super.constructor.call(this, root);

	this._editorUI = editorUI;
	this._editor = editor;
	this._type = type;
	this._layer = layer || "UI";
	this._selected = false;

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
		g: 0.5,
		b: 0
	};

	this._pressed = {
		r: 0.5,
		g: 0.5,
		b: 0.5
	};

	this._selected = {
		r: 0.95,
		g: 1,
		b: 0
	};

	this.initialise();
};

_.inherit(EditorTool, Button);

_.extend(EditorTool.prototype, {
	initialise: function()
	{
		this.setOnReleased(this.onReleased, this);
		this.setOnPressed(this.onPressed, this);
		this.setOnEnter(this.onEnter, this);
		this.setOnLeave(this.onLeave, this);
	},

	setUI: function()
	{
		this._setDefaultBlend();
		var tex = this._toolTextures[this._type];

		this.setDiffuseMap(tex);
		this.setTextures(tex);
		this.spawn(this._layer);
	},

	setSelected: function(v)
	{
		this._isSelected = v;
		this._setDefaultBlend();
	},

	_setDefaultBlend: function()
	{
		if (this._isSelected == true)
		{
			this.setBlend(this._selected.r, this._selected.g, this._selected.b);
			return;
		}

		this.setBlend(1, 1, 1);
	},

	show: function()
	{

	},

	hide: function()
	{

	},

	onReleased: function()
	{
		this.setSelected(true);

		this._editor.setTool(this._type);
		this._editorUI.toolNotification(this._type);
	},

	type: function()
	{
		return this._type;
	},

	onEnter: function()
	{
		this.setBlend(this._hover.r, this._hover.g, this._hover.b);
	},

	onLeave: function()
	{
		this._setDefaultBlend()
	},

	onPressed: function()
	{
		this.setBlend(this._pressed.r, this._pressed.g, this._pressed.b);
	}
});