require("js/ui/editor/editor_texture_entry");

var EditorTextureView = EditorTextureView || function(ui, textures, layer)
{
	EditorTextureView._super.constructor.call(this, layer);

	this._editorUI = ui;
	this._textures = textures;

	this._entries = [];

	this._metrics = {
		size: {
			width: 320,
			height: 240
		},

		position: Vector2D.construct(600, 256)
	};

	this._entryOffset = 96;
	this._selected = undefined;

	this._maxPerRow = 3;

	this.initialise();
};

_.inherit(EditorTextureView, ScrollArea);

_.extend(EditorTextureView.prototype, {
	initialise: function()
	{
		for (var i = 0; i < this._textures.length; ++i)
		{
			this._entries.push(
				new EditorTextureEntry(
					this,
					this._textures[i],
					i == 0 ? undefined : this._entries[this._entries.length - 1]
				)
			);
		}
	},

	setUI: function()
	{
		var m = this._metrics;
		this.setSize(m.size.width, m.size.height);
		this.setPosition(m.position.x, m.position.y);

		if (this._entries.length == 0)
		{
			return;
		}

		var top = this._entries[0];

		this._selected = top;
		this.addChild(top);

		var entry;
		for (var i = 0; i < this._entries.length; ++i)
		{
			entry = this._entries[i];
			entry.setUI(i, i == 0 ? 0 : this._entryOffset, this._maxPerRow);
		}

		top.setSelected(true);

		this._top = top;
		this.setMax(0, Math.floor(this._entries.length / this._maxPerRow) * this._entryOffset);
	},

	onChange: function(changed)
	{
		var entry;
		for (var i = 0; i < this._entries.length; ++i)
		{
			entry = this._entries[i];

			if (entry !== changed)
			{
				entry.setSelected(false);
			}
		}

		this._selected = changed;
	},

	update: function(dt)
	{
		if (this.focussed() == false)
		{
			return;
		}
		if (Mouse.wheelDown())
		{
			this.scrollBy(0, 50);
		}
		else if (Mouse.wheelUp())
		{
			this.scrollBy(0, -50);
		}

		if (Keyboard.isDown(Key.Down))
		{
			this.scrollBy(0, dt * 500);
		}
		else if (Keyboard.isDown(Key.Up))
		{
			this.scrollBy(0, -dt * 500);
		}
	},

	setAlpha: function(a)
	{
		this._top.setAlpha(a);
	},

	selected: function()
	{
		return this._selected;
	}
});