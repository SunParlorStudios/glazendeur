function State ()
{
	this.world = new World();
}

_.extend(State.prototype, {
	init: function ()
	{

	},
	show: function ()
	{

	},
	leave: function ()
	{

	},
	update: function (dt) 
	{
		this.world.update(dt);
	},
	fixedUpdate: function (dt)
	{

	},
	draw: function (dt) {

	},
	reload: function () {

	},
	shutdown: function ()
	{

	},
	serialize: function ()
	{
		return JSON.stringify(this);
	}
});