require("js/ui/editor/editor_tool");

Enum("EditorUILayer",[
	"Root",
	"Widgets"
]);

ContentManager.load("texture", "textures/editor/widgets/tools/raise.png");
ContentManager.load("texture", "textures/editor/widgets/tools/paint.png");
ContentManager.load("texture", "textures/editor/widgets/tools/smooth.png");
ContentManager.load("texture", "textures/editor/widgets/tools/raise_hover.png");
ContentManager.load("texture", "textures/editor/widgets/tools/paint_hover.png");
ContentManager.load("texture", "textures/editor/widgets/tools/smooth_hover.png");
ContentManager.load("texture", "textures/editor/widgets/tools/raise_pressed.png");
ContentManager.load("texture", "textures/editor/widgets/tools/paint_pressed.png");
ContentManager.load("texture", "textures/editor/widgets/tools/smooth_pressed.png");

var EditorUI = EditorUI || function(editor, root)
{
	this._editor = editor;
	this._inputWidget = undefined;
	this._root = root || undefined;
	this._toolNames = [
		"Raise",
		"Paint",
		"Smooth"
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
	},

	show: function()
	{

	},

	hide: function()
	{

	},

	_disableInput: function()
	{
		this._editor.setInputEnabled(false);
	},

	_enableInput: function()
	{
		this._editor.setInputEnabled(true);
	}
});