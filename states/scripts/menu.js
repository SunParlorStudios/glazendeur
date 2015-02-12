var Menu = Menu || function()
{
		
}

_.inherit(Menu, State);

_.extend(Menu.prototype, {
	update: function ()
	{
		Log.fatal("hallo");
	}
});