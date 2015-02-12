var Menu = Menu || function()
{
	Menu._super.constructor.call(this, arguments);
}

_.inherit(Menu, State);

_.extend(Menu.prototype, {
	update: function (dt)
	{
		Menu._super.update.call(this, dt);
	}
});