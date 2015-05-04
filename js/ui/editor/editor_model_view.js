require("js/ui/editor/editor_model_entry");

var EditorModelView = EditorModelView || function(ui, props, layer)
{
	EditorModelView._super.constructor.call(this, layer);

	this._editorUI = ui;
	this._props = props;

	this._entries = [];

	this._metrics = {
		size: {
			width: 320,
			height: 240
		},

		position: Vector2D.construct(600, 256)
	};

	this._entryOffset = 40;
	this._selected = undefined;

	this.initialise();
};

_.inherit(EditorModelView, ScrollArea);

_.extend(EditorModelView.prototype, {
	initialise: function()
	{
		this._background = new Widget();
		for (var i = 0; i < this._props.length; ++i)
		{
			this._entries.push(
				new EditorModelEntry(
					this,
					this._props[i], 
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

		this._background.setSize(m.size.width, m.size.height);
		this._background.setTranslation(m.position.x, m.position.y);

		this._background.setBlend(0.1, 0.1, 0.1);
		this._background.spawn("UI");

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
			entry.setUI(i == 0 ? 0 : this._entryOffset);
		}

		top.setSelected(true);

		this._top = top;
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

	setAlpha: function(a)
	{
		this._top.setAlpha(a);
	},

	selected: function()
	{
		return this._selected;
	}
});