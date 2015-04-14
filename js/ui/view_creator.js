require('js/ui/view');
require('js/ui/button');

var ViewCreator = ViewCreator || {};

_.extend(ViewCreator, {
	overwrite: false,
	override: false
}, {
	createView: function (path)
	{
		var data = JSON.load(path).GameProjectFile.Content[0].Content[0].ObjectData[0].Children;

		if (data !== undefined)
		{
			data = data[0].NodeObjectData;
		}
		else
		{
			return;
		}

		var view = new View();
		view.__elements = data;

		return view;
	},

	getResourceList: function (data, resources)
	{
		var resources = resources || [];

		var isInResources = function(path)
		{
			var found = false;
			for (var j = 0; j < resources.length; j++)
			{
				if (resources[j][1] == 'ui/cocosstudio/' + path)
				{
					found = true;
					break;
				}
			}

			return found;
		}

		for (var i = 0; i < data.length; i++)
		{
			var child = data[i];

			switch (child['$'].ctype)
			{
				case "SpriteObjectData":
				case "ImageViewObjectData":
					if (!isInResources(child.FileData[0]['$'].Path)) {
						resources.push(["texture", 'ui/cocosstudio/' + child.FileData[0]['$'].Path]);
					}

					if (child.Children !== undefined)
					{
						this.getResourceList(child.Children[0].NodeObjectData, resources);
					}
					break;
				case "ButtonObjectData":
					if (!isInResources(child.NormalFileData[0]['$'].Path) && child.NormalFileData[0]['$'].Path !== 'Default/Button_Normal.png')
					{
						resources.push(['texture', 'ui/cocosstudio/' + child.NormalFileData[0]['$'].Path]);
					}
					if (!isInResources(child.DisabledFileData[0]['$'].Path) && child.DisabledFileData[0]['$'].Path !== 'Default/Button_Disable.png')
					{
						resources.push(['texture', 'ui/cocosstudio/' + child.DisabledFileData[0]['$'].Path]);
					}
					if (!isInResources(child.PressedFileData[0]['$'].Path) && child.PressedFileData[0]['$'].Path !== 'Default/Button_Pressed.png')
					{
						resources.push(['texture', 'ui/cocosstudio/' + child.PressedFileData[0]['$'].Path]);
					}
					break;
			}
		}

		return resources;
	},

	initializeChildren: function (view, data, parent)
	{
		for (var i = 0; i < data.length; i++)
		{
			var child = data[i];

			var widget;

			switch (child['$'].ctype)
			{
				case "SpriteObjectData":
				case "ImageViewObjectData":
					widget = new Widget(parent);
					widget.setDiffuseMap('ui/cocosstudio/' + child.FileData[0]['$'].Path);
					widget.setSize(parseInt(child.Size[0]['$'].X), parseInt(child.Size[0]['$'].Y));
					widget.setOffset(parseFloat(child.AnchorPoint[0]['$'].ScaleX), parseFloat(child.AnchorPoint[0]['$'].ScaleY));

					break;
				case "ButtonObjectData":
					widget = new Button(parent);
					widget.setTextures(
						child.NormalFileData[0]['$'].Path !== 'Default/Button_Normal.png' ? 'ui/cocosstudio/' + child.NormalFileData[0]['$'].Path : null,
						child.DisabledFileData[0]['$'].Path !== 'Default/Button_Disable.png' ? 'ui/cocosstudio/' + child.DisabledFileData[0]['$'].Path : null,
						child.PressedFileData[0]['$'].Path !== 'Default/Button_Pressed.png' ? 'ui/cocosstudio/' + child.PressedFileData[0]['$'].Path : null
					);

					widget.setDiffuseMap('ui/cocosstudio/' + child.NormalFileData[0]['$'].Path);
					widget.setSize(parseInt(child.Size[0]['$'].X), parseInt(child.Size[0]['$'].Y));
					widget.setOffset(parseFloat(child.AnchorPoint[0]['$'].ScaleX), parseFloat(child.AnchorPoint[0]['$'].ScaleY));

					break;
				case "TextObjectData":
					widget = new Text(parent);
					widget.setText(child['$'].LabelText);
					widget.setFont('fonts/' + child.FontResource[0]['$'].Path);
					widget.setFontSize(parseInt(child['$'].FontSize));

					widget.setOffset(parseFloat(child.AnchorPoint[0]['$'].ScaleX) * widget.metrics().w, parseFloat(child.AnchorPoint[0]['$'].ScaleY) * widget.metrics().h);

					switch (child['$'].HorizontalAlignmentType)
					{
						case "HT_Center":
							widget.setAlignment(TextAlignment.Center);
							break;
						case "HT_Left":
							widget.setAlignment(TextAlignment.Left);
							break;
						case "HT_Right":
							widget.setAlignment(TextAlignment.Right);
							break;
						default:
							widget.setAlignment(TextAlignment.Left);
							break;
					}

					break;
			}

			widget.setScale(parseFloat(child.Scale[0]['$'].ScaleX), parseFloat(child.Scale[0]['$'].ScaleY), 1);

			if (child['$'].Rotation !== undefined)
			{
				widget.setRotation(0, 0, parseInt(child['$'].Rotation) * (Math.PI / 180));
			}

			if (parent === undefined)
			{
				widget.setTranslation(
					parseInt(child.Position[0]['$'].X - RenderSettings.resolution().w / 2), 
					parseInt((child.Position[0]['$'].Y - RenderSettings.resolution().h / 2) * -1), 
					parseInt(child['$'].Tag)
				);

				if (child['$'].Alpha !== undefined)
				{
					widget.setAlpha(parseFloat(parseInt(child['$'].Alpha) / 255));
				}

				if (child['$'].VisibleForFrame === undefined)
				{
					widget.visible = true;
				}
				else
				{
					widget.visible = false;
				}
			}
			else
			{
				if (!parent.setFont)
				{
					widget.setTranslation(
						parseInt(parseInt(child.Position[0]['$'].X) + (parent.size().x * (parent.offset().x * -1))), 
						parseInt((parseInt(child.Position[0]['$'].Y) + (parent.size().y * (parent.offset().y * -1))) * -1), 
						parseInt(child['$'].Tag)
					);
				}
				else
				{
					widget.setTranslation(
						parseInt(parseInt(child.Position[0]['$'].X) + (parent.offset().x)), 
						parseInt((parseInt(child.Position[0]['$'].Y) + (parent.offset().y)) * -1), 
						parseInt(child['$'].Tag)
					);
				}

				if (child['$'].Alpha !== undefined)
				{
					widget.setAlpha(parseFloat(parseInt(child['$'].Alpha) / 255 - (1 - parent.alpha())));
				}
				else
				{
					widget.setAlpha(parent.alpha());
				}

				if (parent.visible == false)
				{
					widget.visible = false;
				}
				else
				{
					if (child['$'].VisibleForFrame === undefined)
					{
						widget.visible = true;
					}
					else
					{
						widget.visible = false;
					}
				}
			}

			widget.___ISANOBJECT___ = true;
			view[child['$'].Name] = widget;

			if (child.Children !== undefined)
			{
				this.initializeChildren(view[child['$'].Name], child.Children[0].NodeObjectData, view[child['$'].Name]);
			}
		}
	}
});

function LogObject(obj, indent) {
	if (indent === undefined)
		indent = 0;

	for (var key in obj)
	{
		var str = "";

		for (var i = 0; i < indent; i++)
		{
			str += "  ";
		}

		if (typeof obj[key] == "object")
		{
			str += key;
			Log.info(str);
			LogObject(obj[key], indent + 1);
		}
		else
		{
			str += key + ': ' + obj[key];
			Log.info(str);
		}
	}
}