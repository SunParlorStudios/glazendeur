require("js/ui/editor/editor_tool");

ContentManager.load("texture", "textures/editor/widgets/tools/raise.png");
ContentManager.load("texture", "textures/editor/widgets/tools/paint.png");
ContentManager.load("texture", "textures/editor/widgets/tools/smooth.png");
ContentManager.load("texture", "textures/editor/widgets/tools/raise_hover.png");
ContentManager.load("texture", "textures/editor/widgets/tools/paint_hover.png");
ContentManager.load("texture", "textures/editor/widgets/tools/smooth_hover.png");
ContentManager.load("texture", "textures/editor/widgets/tools/raise_pressed.png");
ContentManager.load("texture", "textures/editor/widgets/tools/paint_pressed.png");
ContentManager.load("texture", "textures/editor/widgets/tools/smooth_pressed.png");

var EditorUI = EditorUI || function()
{
	this._root = undefined;
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
		this._root = new Widget();

		this._tools = [];
		for (var i = 0; i < this._numTools; ++i)
		{
			this._tools.push(new EditorTool(this._root, EditorTools[this._toolNames[i]], "UI"));
		}

		this.setUI();
	},

	setUI: function()
	{
		var res = RenderSettings.resolution();
		this._root.setTranslation(
			res.w / 2 - this._metrics.toolWidth - this._metrics.toolPadding, 
			-res.h / 2 + this._metrics.toolPadding, 0);

		var t = this._root.translation();
		Log.info(t.x);
		Log.info(t.y);
		Log.info(t.z);

		for (var i = 0; i < this._numTools; ++i)
		{
			var tool = this._tools[i];
			var w = this._metrics.toolWidth;
			var h = this._metrics.toolHeight;

			tool.setSize(w, h);
			tool.setTranslation(0, i * (h + this._metrics.toolPadding), 0);
			tool.setUI();
		}
	},

	show: function()
	{

	},

	hide: function()
	{

	}
});