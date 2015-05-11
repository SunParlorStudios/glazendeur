var EditorModelEntry = EditorModelEntry || function(ui, path, root)
{
	EditorModelEntry._super.constructor.call(this, root);

	this._ui = ui;
	this._path = path;

	this._pressed = {
		r1: 0.3, r2: 0,
		g1: 0.3, g2: 0,
		b1: 0.3, b2: 0
	};

	this._hover = {
		r1: 1, r2: 0,
		g1: 1, g2: 0,
		b1: 1, b2: 0
	};

	this._default = {
		r1: 0, r2: 1,
		g1: 0, g2: 1,
		b1: 0, b2: 1
	};

	this._selected = {
		r1: 0.5, r2: 1,
		g1: 0.25, g2: 0.5,
		b1: 0, b2: 0
	};

	this._padding = 5;
	this._isSelected = false;

	this.initialise();
};

_.inherit(EditorModelEntry, Widget);

_.extend(EditorModelEntry.prototype, {
	initialise: function()
	{
		this._bar = new Button(this);
		this._text = new Text(this._bar);
	},

	setUI: function(offset)
	{
		this.setTranslation(0, offset);
		this._bar.spawn();

		this._text.setText(this._path);
		this._text.spawn();
		this._text.setFontSize(24);
		this._text.setTranslation(this._padding, this._padding);
		var m = this._text.metrics();

		this._bar.setSize(m.w + this._padding * 2, m.h + this._padding * 2);

		this._bar.setBlend(0, 0, 0);

		this._bar.setOnPressed(this._onPressed, this);
		this._bar.setOnReleased(this._onReleased, this);
		this._bar.setOnEnter(this._onEnter, this);
		this._bar.setOnLeave(this._onLeave, this);

		this._resetBlend();

		this.setZ(1000);
		this._bar.setZ(1001);
		this._text.setZ(1002);
	},

	_onPressed: function()
	{
		this._bar.setBlend(this._pressed.r1, this._pressed.g1, this._pressed.b1);
		this._text.setBlend(this._pressed.r2, this._pressed.g2, this._pressed.b2);
	},

	_onReleased: function()
	{
		this.setSelected(true);
		this._ui.onChange(this);
	},

	_onEnter: function()
	{
		this._bar.setBlend(this._hover.r1, this._hover.g1, this._hover.b1);
		this._text.setBlend(this._hover.r2, this._hover.g2, this._hover.b2);
	},

	_onLeave: function()
	{
		this._resetBlend();
	},

	_resetBlend: function()
	{
		var col = this._isSelected === true ? this._selected : this._default;

		this._bar.setBlend(col.r1, col.g1, col.b1);
		this._text.setBlend(col.r2, col.g2, col.b2);
	},

	setSelected: function(selected)
	{
		this._isSelected = selected;
		this._resetBlend();
	},

	path: function()
	{
		return this._path;
	}
});