var Test = Test || function(params)
{
	Test._super.constructor.call(this, arguments);
	this._quad = this._renderables[0];

	this._quad.setTranslation(params.x, 0, 0);
}

_.inherit(Test, Entity);

_.extend(Test.prototype, {
	onUpdate: function(dt)
	{
		
	}
});