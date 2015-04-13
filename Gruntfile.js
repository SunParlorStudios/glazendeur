/**
 * Gruntfile for glazendeur
 *
 * Not much to see here, move along.
 */

module.exports = function(grunt) {
	grunt.registerTask('ui', function() {
		var files = [
			"./ui/cocosstudio/editor.csd",
			"./ui/cocosstudio/loader.csd",
			"./ui/cocosstudio/menu.csd"
		];

		var xml2json = require('xml2js');

		for (var i = 0; i < files.length; i++)
		{
			xml2json.parseString(grunt.file.read(files[i]), function (err, result) {
				grunt.file.write(files[i].substr(0, files[i].length - 3) + 'json', JSON.stringify(result));
			});
		}
	});
};