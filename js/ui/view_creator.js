require('js/ui/view');

var ViewCreator = ViewCreator || {};

_.extend(ViewCreator, {
	overwrite: false,
	override: false
}, {
	createView: function (path)
	{
		var data = xml2json.parser(IO.read(path)).gameprojectfile.content.content.objectdata;
		if (data.children === undefined)
		{
			return;
		}

		var view = {};

		Log.info(JSON.stringify(xml2json.parser(IO.read(path))));

		//LogObject(data);

		//this.parseChildren(view, data);
	},

	parseChildren: function (view, alldata)
	{
		var data = alldata.children.nodeobjectdata;
		for (var i = 0; i < data.length; i++)
		{
			var child = data[i];
			var childData = child.children;

			switch (child.ctype)
			{
				case "SpriteObjectData":
				case "ImageViewObjectData":
					Log.info(child.name);
					break;
				case "ButtonObjectData":
					Log.info(child.name);
					break;
			}

			//if (child.children !== undefined)
				//this.parseChildren(view, alldata);
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