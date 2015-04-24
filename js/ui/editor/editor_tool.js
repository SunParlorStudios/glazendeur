var EditorTool = EditorTool || function(editor, button, tool)
{
	this._editor = editor;
	this._button = button;
	this._tool = tool;

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

	this._button.setOnReleased(this.onReleased, this);
	this._button.setOnPressed(this.onPressed, this);
	this._button.setOnEnter(this.onEnter, this);
	this._button.setOnLeave(this.onLeave, this);
};

_.extend(EditorTool.prototype, {
	setSelected: function(v)
	{
		this._isSelected = v;
		this.setDefaultBlend();
	},

	setDefaultBlend: function()
	{
		if (this._isSelected == true)
			this._button.setBlend(this._selected.r, this._selected.g, this._selected.b);
		else
			this._button.setBlend(1, 1, 1);
	},

	onReleased: function()
	{
		this.setSelected(true);
		this._editor.setTool(this._tool);
	},

	onEnter: function()
	{
		this._button.setBlend(this._hover.r, this._hover.g, this._hover.b);
	},

	onLeave: function()
	{
		this.setDefaultBlend();
	},

	onPressed: function()
	{
		this._button.setBlend(this._pressed.r, this._pressed.g, this._pressed.b);
	}
});