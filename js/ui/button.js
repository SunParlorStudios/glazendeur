var Button = Button || function(root)
{
	Button._super.constructor.call(this, root);
	this._mouseArea = new MouseArea(this);

	this._textures = {}

	this._onEnter = function(button)
	{
		this.setDiffuseMap(this._textures.hover)
	};
	this._onLeave = function(button)
	{
		this.setDiffuseMap(this._textures.default)
	};
	this._onPressed = function(button)
	{
		this.setDiffuseMap(this._textures.pressed)
	};
	this._onReleased = function(button)
	{
		this.setDiffuseMap(this._textures.default)
	};
	this._onDown = function(button)
	{
		
	};

	this._onEnter.ctx = this;
	this._onLeave.ctx = this;
	this._onPressed.ctx = this;
	this._onReleased.ctx = this;
	this._onDown.ctx = this;

	this._mouseArea.setOnEnter(this._onEnter);
	this._mouseArea.setOnLeave(this._onLeave);
	this._mouseArea.setOnPressed(this._onPressed);
	this._mouseArea.setOnReleased(this._onReleased);
	this._mouseArea.setOnDown(this._onDown);
}

_.inherit(Button, Widget);

_.extend(Button.prototype, {
	setActivated: function(v)
	{
		this._mouseArea.setActivated(v);
	},

	setTextures: function(texture, hover, pressed)
	{
		this._textures.default = texture || this._textures.default;
		this._textures.hover = hover || this._textures.hover;
		this._textures.pressed = pressed || this._textures.pressed;
	},

	setOnEnter: function(func)
	{
		this._onEnter = function(button)
		{
			func.call(this, button);
			this.setDiffuseMap(this._textures.hover);
		}
		this._onEnter.ctx = this;
		this._mouseArea.setOnEnter(this._onEnter);
	},

	setOnLeave: function(func)
	{
		this._onLeave = function(button)
		{
			func.call(this, button);
			this.setDiffuseMap(this._textures.default);
		}
		this._onLeave.ctx = this;
		this._mouseArea.setOnLeave(this._onLeave);
	},

	setOnPressed: function(func)
	{
		this._onPressed = function(button)
		{
			func.call(this, button);
			this.setDiffuseMap(this._textures.pressed);
		}
		this._onPressed.ctx = this;
		this._mouseArea.setOnPressed(this._onPressed);
	},

	setOnReleased: function(func)
	{
		this._onReleased = function(button)
		{
			func.call(this, button);
			this.setDiffuseMap(this._textures.default);
		}
		this._onReleased.ctx = this;
		this._mouseArea.setOnReleased(this._onReleased);
	},

	setOnDown: function(func)
	{
		this._onDown = function(button)
		{
			func.call(this, button);
			func(button, this);
		}
		this._onDown.ctx = this;
		this._mouseArea.setOnDown(this._onDown);
	}
});