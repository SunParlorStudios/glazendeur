require("js/ui/editor/editor_tool");

var EditorUI = EditorUI || function()
{
	ContentManager.load("texture", "textures/editor/widgets/tools/raise.png");
	ContentManager.load("texture", "textures/editor/widgets/tools/paint.png");
	ContentManager.load("texture", "textures/editor/widgets/tools/smooth.png");
	this.initialise();
	this._test = new Button();
	this._test.setSize(64, 64);
	this._test.spawn("UI");
	this._test.setTextures("textures/editor/widgets/tools/paint.png", "textures/editor/widgets/tools/raise.png", "textures/editor/widgets/tools/smooth.png");
}

_.extend(EditorUI.prototype, {
	initialise: function()
	{
		this._buttons = [];

	},

	setUI: function()
	{

	},

	show: function()
	{

	},

	hide: function()
	{

	}
});
