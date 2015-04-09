require("js/ui/editor/editor_tool");

Enum("EditorUILayer",[
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
	]

	this._numTools = this._toolNames.length;

	this._metrics = {
		toolWidth: 84,
		toolHeight: 84,
		toolPadding: 10
	}

	this.initialise();
}

_.extend(EditorUI.prototype, {
	initialise: function()
	{
		this._inputWidget = new Widget();
		this._inputArea = new MouseArea(this._inputWidget);

		if (this._root === undefined)
		{
			this._root = new Widget();
		}

		this._tools = [];
		for (var i = 0; i < this._numTools; ++i)
		{
			this._tools.push(new EditorTool(this._root, this._editor, EditorTools[this._toolNames[i]], "UI"));
		}

		this._currentTexture = new Widget(this._root);
		this._currentTextureMouseArea = new MouseArea(this._currentTexture);
		this._currentBrush = new Widget(this._currentTexture);
		this._currentBrushMouseArea = new MouseArea(this._currentBrush);

		this.setUI();
	},

	setUI: function()
	{
		var res = RenderSettings.resolution();

		this._root.setZ(EditorUILayer.Widgets);

		this._disableInput.ctx = this;
		this._enableInput.ctx = this;

		this._inputWidget.setZ(EditorUILayer.Root);
		this._inputWidget.setSize(res.w, res.h);
		this._inputWidget.setOffset(0.5, 0.5);

		this._inputArea.setOnEnter(this._enableInput);
		this._inputArea.setOnLeave(this._disableInput);

		this._root.setTranslation(
			res.w / 2 - this._metrics.toolWidth - this._metrics.toolPadding, 
			-res.h / 2 + this._metrics.toolPadding, 0);

		for (var i = 0; i < this._numTools; ++i)
		{
			var tool = this._tools[i];
			var w = this._metrics.toolWidth;
			var h = this._metrics.toolHeight;

			tool.setSize(w, h);
			tool.setTranslation(0, i * (h + this._metrics.toolPadding), EditorUILayer.Widgets);
			tool.setUI();
		}

		var h = this._metrics.toolHeight;
		this._currentTexture.setSize(this._metrics.toolWidth, h);
		this._currentTexture.spawn("UI");
		this._currentTexture.setTranslation(0, this._numTools * (h + this._metrics.toolPadding), EditorUILayer.Widgets);

		this._currentBrush.setSize(this._metrics.toolWidth, h);
		this._currentBrush.spawn("UI");
		this._currentBrush.setTranslation(0, h + this._metrics.toolPadding, EditorUILayer.Widgets);

		this._changeTexture.ctx = this;
		this._changeBrush.ctx = this;

		this._currentTextureMouseArea.setOnEnter(this._disableInput);
		this._currentTextureMouseArea.setOnLeave(this._enableInput);
		this._currentTextureMouseArea.setOnReleased(this._changeTexture)

		this._currentBrushMouseArea.setOnEnter(this._disableInput);
		this._currentBrushMouseArea.setOnLeave(this._enableInput);
		this._currentBrushMouseArea.setOnReleased(this._changeBrush)
	},

	show: function()
	{

	},

	hide: function()
	{

	},

	setCurrentTexture: function(texture)
	{
		this._currentTexture.setDiffuseMap(texture);
	},

	setCurrentBrush: function(texture)
	{
		this._currentBrush.setDiffuseMap(texture);
	},

	_changeTexture: function()
	{
		this._editor.changeTexture();
	},

	_changeBrush: function()
	{
		this._editor.changeBrush();
	},

	_disableInput: function()
	{
		this._editor.addInputDisable(InputDisable.UI);
	},

	_enableInput: function()
	{
		this._editor.removeInputDisable(InputDisable.UI);
	}
});