var Button = Button || function()
{
	this._mouseArea = new MouseArea(this);
	this._textures = {}
}

_.inherit(Button, Widget);

_.extend(Button.prototype, {
	setTextures: function(hover, pressed)
	{
		this._textures.hover = hover || this._textures.hover;
		this._textures.pressed = pressed || this._textures.pressed;
	},

	setOnEnter: function(func)
	{
		var b = this;
		this._onEnter = function(button)
		{
			func(button);
			b.
		}
		this._mouseArea.setOnEnter(func);
	},

	setOnLeave: function(func)
	{
		this._mouseArea.setOnLeave(func);
	},

	setOnPressed: function(func)
	{
		this._mouseArea.setOnPressed(func);
	},

	setOnReleased: function(func)
	{
		this._mouseArea.setOnReleased(func);
	},

	setOnDown: function(func)
	{
		this._mouseArea.setOnDown(func);
	}
});