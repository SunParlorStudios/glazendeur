require('js/ui/view');

var ViewCreator = ViewCreator || {};

_.extend(ViewCreator, {
	overwrite: false,
	override: false
}, {
	createView: function (path)
	{
		var data = JSON.load(path).GameProjectFile.Content[0].Content[0].ObjectData[0].Children[0].NodeObjectData;

		var view = {};

		LogObject(data);

		this.parseChildren(view, data);

		return view;
	},

	parseChildren: function (view, data)
	{
		for (var i = 0; i < data.length; i++)
		{
			var child = data[i];

			switch (child['$'].ctype)
			{
				case "SpriteObjectData":
				case "ImageViewObjectData":
					var widget = new Widget();

					widget.setTranslation(
						parseInt(child.Position[0]['$'].X - RenderSettings.resolution().w / 2), 
						parseInt((child.Position[0]['$'].Y - RenderSettings.resolution().h / 2) * -1), 
						0
					);

					ContentManager.load('texture', 'ui/cocosstudio/' + child.FileData[0]['$'].Path);
					widget.setDiffuseMap('ui/cocosstudio/' + child.FileData[0]['$'].Path);

					widget.setSize(parseInt(child.Size[0]['$'].X), parseInt(child.Size[0]['$'].Y));
					widget.setOffset(parseInt(child.AnchorPoint[0]['$'].ScaleX), parseInt(child.AnchorPoint[0]['$'].ScaleY));

					widget.spawn('UI');

					view[child['$'].Name] = widget;
					break;
				case "ButtonObjectData":
					Log.info(child['$'].Name);
					break;
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