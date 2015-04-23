var Button = Button || function(root)
{
	Button._super.constructor.call(this, root);
	this._mouseArea = new MouseArea(this);

	this._textures = {};

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
		this.setDiffuseMap(this._textures.hover)
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
		this._textures.default = texture !== null ? texture : this._textures.default;
		this._textures.hover = hover !== null ? hover : this._textures.hover;
		this._textures.pressed = pressed !== null ? pressed : this._textures.pressed;

		if (this._textures.hover == null)
		{
			this._textures.hover = this._textures.default;
		}
		if (this._textures.pressed == null)
		{
			this._textures.pressed = this._textures.default;
		}
	},

	setOnEnter: function(func, ctx)
	{
		var self = this;
		this._onEnter = function(button)
		{
			func.call(self._onEnter.ctx, button);
			self.setDiffuseMap(self._textures.hover);
		}
		this._onEnter.ctx = ctx || this;
		this._mouseArea.setOnEnter(this._onEnter);
	},

	setOnLeave: function(func, ctx)
	{
		var self = this;
		this._onLeave = function(button)
		{
			func.call(self._onLeave.ctx, button);
			self.setDiffuseMap(self._textures.default);
		}
		this._onLeave.ctx = ctx || this;
		this._mouseArea.setOnLeave(this._onLeave);
	},

	setOnPressed: function(func, ctx)
	{
		var self = this;
		this._onPressed = function(button)
		{
			func.call(self._onPressed.ctx, button);
			self.setDiffuseMap(self._textures.pressed);
		}
		this._onPressed.ctx = ctx || this;
		this._mouseArea.setOnPressed(this._onPressed);
	},

	setOnReleased: function(func, ctx)
	{
		var self = this;
		this._onReleased = function(button)
		{
			func.call(self._onReleased.ctx, button);
			self.setDiffuseMap(self._textures.hover);
		}
		this._onReleased.ctx = ctx || this;
		this._mouseArea.setOnReleased(this._onReleased);
	},

	setOnDown: function(func, ctx)
	{
		var self = this;
		this._onDown = function(button)
		{
			func.call(self._onDown.ctx, button);
		}
		this._onDown.ctx = ctx || this;
		this._mouseArea.setOnDown(this._onDown);
	}
});