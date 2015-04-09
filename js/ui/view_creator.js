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

		data = data.children.nodeobjectdata;
		for (var i = 0; i < data.length; i++)
		{
			var child = data[i];
		}
	}
});