require("js/ui/editor/editor_tool");
require("js/ui/editor/editor_slider");

Enum("EditorUILayer",[
	"Input",
	"Root",
	"Widgets"
]);

var EditorUI = EditorUI || function(editor, root)
{
	this._editor = editor;
	this._inputWidget = undefined;
	this._root = root || undefined;
	this._toolNames = [
		"Raise",
		"Paint",
		"Smooth",
		"Ramp",
		"Flatten"
	];

	this._numTools = this._toolNames.length;

	this._metrics = {
		toolWidth: 84,
		toolHeight: 84,
		toolPadding: 10
	};
};

_.extend(EditorUI.prototype, {
	initialise: function()
	{
		this._inputWidget = new Widget();
		this._inputArea = new MouseArea(this._inputWidget);

		if (this._root === undefined)
		{
			this._root = new Widget();
		}

		this._rootArea = new MouseArea(this._root);

		this._tools = [];
		for (var i = 0; i < this._numTools; ++i)
		{
			this._tools.push(new EditorTool(this._root, this._editor, this, EditorTools[this._toolNames[i]], "UI"));
		}

		var strength = this._editor.brushStrength();
		this._slider = new EditorSlider(strength.min, strength.max, this._root);

		this.setUI();
	},

	setUI: function()
	{
		var res = RenderSettings.resolution();

		this._root.setZ(EditorUILayer.Widgets);

		this._disableInput.ctx = this;
		this._enableInput.ctx = this;

		this._inputWidget.setZ(EditorUILayer.Input);
		this._inputWidget.setSize(res.w, res.h);
		this._inputWidget.setOffset(0.5, 0.5);

		this._inputArea.setOnEnter(this._enableInput);
		this._inputArea.setOnLeave(this._disableInput);

		this._root.setTranslation(
			this._metrics.toolPadding, 
			res.h / 2 - this._metrics.toolHeight - this._metrics.toolPadding * 2, EditorUILayer.Root);

		var totalWidth = this._metrics.toolPadding + this._numTools * (this._metrics.toolWidth + this._metrics.toolPadding);
		var totalHeight = this._metrics.toolPadding * 2 + this._metrics.toolHeight;

		this._root.translateBy(-totalWidth / 2, 0, 0);
		this._root.spawn("UI");

		this._root.setSize(totalWidth, totalHeight);
		this._root.setBlend(0, 0, 0);

		for (var i = 0; i < this._numTools; ++i)
		{
			var tool = this._tools[i];
			var w = this._metrics.toolWidth;
			var h = this._metrics.toolHeight;

			tool.setSize(w, h);
			tool.setTranslation(this._metrics.toolPadding + i * (w + this._metrics.toolPadding), this._metrics.toolPadding, EditorUILayer.Widgets);
			tool.setUI();
		}

		this._slider.setUI();
		this._slider.setZIndex(EditorUILayer.Widgets + 1);

		var strength = this._editor.brushStrength();
		this._slider.setValue(strength.current);
		this._slider.setOnChange(this._onSliderChange, this);

		this._slider.setTranslation(-this._slider.size().x - this._metrics.toolPadding, 0);

		this._tools[0].setSelected(true);
		this._enableInput();
	},

	toolNotification: function(type)
	{
		var tool;
		for (var i = 0; i < this._tools.length; ++i)
		{
			tool = this._tools[i];
			if (tool.type() !== type)
			{
				tool.setSelected(false);
			}
		}
	},

	show: function()
	{

	},

	hide: function()
	{

	},

	_disableInput: function()
	{
		this._editor.addInputDisable(InputDisable.UI);
		this._root.setAlpha(1);
	},

	_enableInput: function()
	{
		this._editor.removeInputDisable(InputDisable.UI);
		this._root.setAlpha(0.5);
	},

	_onSliderChange: function(v)
	{
		this._editor.setBrushStrength(v);
	}
});