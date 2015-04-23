var EditorSlider = EditorSlider || function(min, max, root)
{
	EditorSlider._super.constructor.call(this, root);
	this._root = root;
	this._value = min;
	this._minValue = min;
	this._maxValue = max;

	this._metrics = {
		width: 256,
		height: 16,
		padding: 6,
		textPadding: 6
	};

	this._sliderBlend = {
		r: 1,
		g: 0.5,
		b: 0
	};

	this.initialise();
};

_.inherit(EditorSlider, Widget);

_.extend(EditorSlider.prototype, {
	initialise: function()
	{
		this._box = new Widget(this);
		this._slider = new Widget(this);
		this._text = new Text(this._box);

		this._mouseArea = new MouseArea(this);

		this._onChange = function(v){};
	},

	setUI: function()
	{
		this.setBlend(0, 0, 0);
		this._slider.setBlend(this._sliderBlend.r, this._sliderBlend.g, this._sliderBlend.b);

		this._slider.setSize(this._metrics.width, this._metrics.height);
		this.setSize(this._metrics.width + this._metrics.padding * 2, this._metrics.height + this._metrics.padding * 2);

		this._slider.setTranslation(this._metrics.padding, this._metrics.padding);
		this._mouseArea.setOnReleased(this._changeValue);
		this._mouseArea.setOnDown(this._changeValue);

		this._box.setOffset(0.5, 0.5);
		this._box.setBlend(0, 0, 0);

		this._text.setText("");
		this._text.setBlend(1, 1, 1);
		this._text.setFontSize(24);

		this._slider.spawn("UI");
		this.spawn("UI");
		this._box.spawn("UI");
		this._text.spawn("UI");

		this._changeValue.ctx = this;
	},

	setZIndex: function(z)
	{
		this.setZ(z);
		this._slider.setZ(z + 1);;
		this._box.setZ(z + 1);
		this._text.setZ(z + 2)
	},

	_changeValue: function()
	{
		var p = Mouse.position(MousePosition.Relative);
		var rootTrans = this._root === undefined ? Vector2D.construct(0, 0) : this._root.translation();
		var local = Vector2D.sub(p, Vector2D.add(rootTrans, Vector2D.add(this.translation(), this._slider.translation())));

		Log.info(local.x);
		local.x = Math.max(local.x, 0);
		local.x = Math.min(local.x, this._metrics.width);

		var r = local.x / this._metrics.width;
		this.setValue(this._minValue + r * (this._maxValue - this._minValue));

		this._onChange(this._value);
	},

	setValue: function(v)
	{
		this._value = v;

		this._value = Math.max(this._value, this._minValue);
		this._value = Math.min(this._value, this._maxValue);

		this._text.setText("" + Math.round(v));
		var m = this._text.metrics();
		this._text.setOffset(m.w / 2, 12);

		var w = m.w + this._metrics.textPadding * 2;
		var h = m.h + this._metrics.textPadding * 2
		this._box.setSize(w, h);
		this._box.setTranslation(-w / 2, h / 3);

		var r = (this._value - this._minValue) / (this._maxValue - this._minValue);
		this._slider.setScale(r, 1);
	},

	value: function()
	{
		return this._value;
	},

	setMaxValue: function(v)
	{
		this._maxValue = v;
	},

	maxValue: function()
	{
		return this._maxValue;
	},

	setOnChange: function(func, ctx)
	{
		var self = this;

		this._onChange = function(v)
		{
			func.call(self._onChange.ctx, v);
		};
		this._onChange.ctx = ctx || this;
	}
});