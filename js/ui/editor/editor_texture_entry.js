var EditorTextureEntry = EditorTextureEntry || function(ui, path, root)
{
	EditorTextureEntry._super.constructor.call(this, root);

	this._ui = ui;
	this._path = path;

	this._pressed = {
		r: 0.3,
		g: 0.3,
		b: 0.3
	};

	this._hover = {
		r: 1,
		g: 1,
		b: 1
	};

	this._default = {
		r: 0.5,
		g: 0.5,
		b: 0.5
	};

	this._selected = {
		r: 1,
		g: 0.5,
		b: 0
	};

	this._isSelected = false;

	this.initialise();
};

_.inherit(EditorTextureEntry, Widget);

_.extend(EditorTextureEntry.prototype, {
	initialise: function()
	{
		this._button = new Button(this);
		this._text = new Text(this);
	},

	setUI: function(index, offset, maxPerRow)
	{
		if (index / maxPerRow == Math.floor(index / maxPerRow) && index / maxPerRow != 0)
		{
			this.setTranslation(-offset * (maxPerRow - 1), offset);
		}
		else
		{
			this.setTranslation(offset, 0);
		}
		
		this._button.spawn();
		this._button.setTextures(this._path + ".png");
		this._button.setDiffuseMap(this._path + ".png");

		this._button.setSize(90, 90);

		this._button.setOnPressed(this._onPressed, this);
		this._button.setOnReleased(this._onReleased, this);
		this._button.setOnEnter(this._onEnter, this);
		this._button.setOnLeave(this._onLeave, this);

		this._resetBlend();

		this.setZ(1000);
		this._button.setZ(1001);
	},

	_onPressed: function()
	{
		this._button.setBlend(this._pressed.r, this._pressed.g, this._pressed.b);
		this._text.setBlend(1, 1, 1);
	},

	_onReleased: function()
	{
		this.setSelected(true);
		this._ui.onChange(this);
	},

	_onEnter: function()
	{
		this._button.setBlend(this._hover.r, this._hover.g, this._hover.b);
		this._text.setBlend(1, 1, 1);
	},

	_onLeave: function()
	{
		this._resetBlend();
	},

	_resetBlend: function()
	{
		var col = this._isSelected === true ? this._selected : this._default;

		this._button.setBlend(col.r, col.g, col.b);
		this._text.setBlend(1, 1, 1);
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