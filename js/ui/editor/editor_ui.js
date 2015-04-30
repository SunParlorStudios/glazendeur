require("js/ui/editor/editor_tool");
require("js/ui/editor/editor_slider");
require("js/ui/editor/editor_model_view");

Enum("EditorUILayer",[
	"Input",
	"Root",
	"Widgets"
]);

/**
*
*
*
* Yo Daniël, aangezien jij hier morgen waarschijnlijk eerder naar kijkt dan ik..
* Ik ben nog bezig geweest met de file, zoals je wel hebt gezien :')
* Heb de UI editor erin verwerkt nu, en is nog niet volledig vlekkeloos nu,
* dus voordat je erin duikt - laat mij nog heel ff hier mee rotzooien zodat 't
* een iets overzichtelijkere chaos word in vergelijking met hiervoor :)
*
* - Hajje? Haije? Haïje? w/e houdoe en bedankt
*
*
*/


var EditorUI = EditorUI || function(editor, root)
{
	this._editor = editor;
	this.view = editor.view;

	this._hover = {
		r: 1,
		g: 0.5,
		b: 0
	};

	this._pressed = {
		r: 0.5,
		g: 0.5,
		b: 0.5
	};

	this._selected = {
		r: 0.95,
		g: 1,
		b: 0
	};

	// resize the visuals for the roots
	this.view.root_world.setSize(600, 200);
	this.view.root_world.setBlend(0, 0, 0);
	this.view.root_path.setSize(600, 200);
	this.view.root_path.setBlend(0, 0, 0);

	// define the visuals for the world toolset
	this._worldTools =
	{
		raise: new EditorTool(this, this.view.root_world.raise, EditorTools.Raise),
		paint: new EditorTool(this, this.view.root_world.paint, EditorTools.Paint),
		smooth: new EditorTool(this, this.view.root_world.smooth, EditorTools.Smooth),
		ramp: new EditorTool(this, this.view.root_world.ramp, EditorTools.Ramp),
		flatten: new EditorTool(this, this.view.root_world.flatten, EditorTools.Flatten),
		props: new EditorTool(this, this.view.root_world.props, EditorTools.Props)
	};

	// define the visuals for the path toolset
	this._pathTools = 
	{
		walkable: new EditorTool(this, this.view.root_path.walkable, PathTools.Walkable),
		unwalkable: new EditorTool(this, this.view.root_path.unwalkable, PathTools.Unwalkable)
	}

	// ugly slider code
	var strength = this._editor.brushStrength();
	this._slider = new EditorSlider(strength.min, strength.max, this.view.root_world);
	this._slider.setUI();

	this._slider.setValue(strength.current);
	this._slider.setOnChange(this._onSliderChange, this);
	this._slider.setTranslation(-600, -42);
	this._slider.setZIndex(EditorUILayer.Widgets + 1);

	// this is not supported in the ui editor yet, so I'm doing this. Shit needs to be done so sorry
	this._modelView = new EditorModelView(this, this._editor.props(), "UI");
	this._modelView.setUI();
	this._modelView.setPosition(600, 128);

	// switch the UI to whatever mode the editor is supposed to be in
	this.switchTo(this._editor._editMode);

	// Input disabling and stuff, ripped from old editor ui..
	this._inputWidget = new Widget();
	this._inputArea = new MouseArea(this._inputWidget);
	this._inputWidget.setZ(EditorUILayer.Input);
	this._inputWidget.setSize(RenderSettings.resolution().w, RenderSettings.resolution().h);
	this._inputWidget.setOffset(0.5, 0.5);

	this._disableInput.ctx = this;
	this._enableInput.ctx = this;
	this._inputArea.setOnEnter(this._enableInput);
	this._inputArea.setOnLeave(this._disableInput);

	this._rootArea = new MouseArea(this.view.input);
};

_.extend(EditorUI.prototype, {
	switchTo: function (mode)
	{
		// disable all UI
		this._slider.hide();

		this.view.root_world.destroy();
		for (var k in this._worldTools)
		{
			this._worldTools[k]._button.destroy();
			this._worldTools[k]._button._mouseArea.setActivated(false);
		}
		
		this.view.root_path.destroy();
		for (var k in this._pathTools)
		{
			this._pathTools[k]._button.destroy();
			this._pathTools[k]._button._mouseArea.setActivated(false);
		}

		// enable the UI we need
		switch(mode)
		{
			case EditMode.World:
				this.view.root_world.spawn("UI");

				for (var k in this._worldTools)
				{
					this._worldTools[k]._button.spawn("UI");
					this._worldTools[k]._button._mouseArea.setActivated(true);
				}

				this._slider.show();
				this.setTool(EditorTools.Raise);
				break;

			case EditMode.Path:
				this.view.root_path.spawn("UI");

				for (var k in this._pathTools)
				{
					this._pathTools[k]._button.spawn("UI");
					this._pathTools[k]._button._mouseArea.setActivated(true);
				}

				this.setTool(PathTools.Walkable);
				break;
		}
	},

	setTool: function(type)
	{
		var tool, tools;

		// decice which toolset we're using
		switch (this._editor._editMode)
		{
			case EditMode.World:
				tools = this._worldTools;
				break;
			case EditMode.Path:
				tools = this._pathTools;
				break;
		}

		// highlight the selected tool in the UI
		for (var k in tools)
		{
			tool = tools[k];
			if (tool._tool !== type)
			{
				tool.setSelected(false);
			}
			else
			{
				tool.setSelected(true);	
			}
		}

		// let the actual editor know we are using a new tool
		this._editor.setTool(type);
	},

	_disableInput: function()
	{
		this._editor.addInputDisable(InputDisable.UI);
		this.view.root_world.setAlpha(1);
		this.view.root_path.setAlpha(1);
		this._modelView.setAlpha(1);
	},

	_enableInput: function()
	{
		this._editor.removeInputDisable(InputDisable.UI);
		this.view.root_world.setAlpha(0.5);
		this.view.root_path.setAlpha(0.5);
		this._modelView.setAlpha(0.5);
	},

	_onSliderChange: function(v)
	{
		this._editor.setBrushStrength(v);
	}
});