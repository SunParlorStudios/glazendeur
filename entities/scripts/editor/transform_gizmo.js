var TransformGizmo = TransformGizmo || function(params)
{
	TransformGizmo._super.constructor.call(this, arguments);
	this._root = this._renderables[0];

	this._axis = {
		x: this._renderables[1],
		y: this._renderables[2],
		z: this._renderables[3]
	}

	this._root.setBlend(1, 1, 0);

	this._axis.x.setBlend(1, 0, 0);
	this._axis.y.setBlend(0, 1, 0);
	this._axis.z.setBlend(0, 0, 1);

	this._axis.x.setRotation(0, 0, Math.PI / 2);
	this._axis.z.setRotation(0, Math.PI / 2, Math.PI / 2);

	this._offset = 12;
	this._offsets = {
		x: Vector3D.construct(this._offset, 0, 0),
		y: Vector3D.construct(0, this._offset, 0),
		z: Vector3D.construct(0, 0, -this._offset)
	}

	this._colours = {
		x: [1, 0, 0],
		y: [0, 1, 0],
		z: [0, 0, 1]	
	}

	this._radius = 5;
	this._editor = params.editor;
	this._camera = params.camera;
	this._selected = undefined;
	this._speed = 0.25;

	this._startPosition = {x: 0, z: 0}
	this._axis.x.setTranslation(0, 1, 0);
	this._axis.y.setTranslation(0, 1, 0);
	this._axis.z.setTranslation(0, 1, 0);

	for (var i = 0; i < this._renderables.length; ++i)
	{
		this._renderables[i].setTechnique("Diffuse");
	}
}

_.inherit(TransformGizmo, Entity);

_.extend(TransformGizmo.prototype, {
	setPosition: function(x, y, z)
	{
		this._root.setTranslation(x, y, z);
	},

	check: function(ray)
	{
		if (this._selected !== undefined && Mouse.isDown(MouseButton.Left))
		{
			return;
		}

		this._selected = undefined;
		var t = this._root.translation();
		var found = false;
		var c;
		var axis;

		for (var i in this._axis)
		{
			axis = this._axis[i];
			c = this._colours[i];
			axis.setBlend(c[0], c[1], c[2]);

			if (ray.sphereIntersection(Vector3D.add(t, this._offsets[i]), this._radius) == true && found == false)
			{
				axis.setBlend(1, 1, 1);
				this._selected = i;
				this._startPosition = this._camera.mouseToWorld();
				found = true;
			}
		}

		this._editor.setInputEnabled(!found && this._selected === undefined);
	},

	move: function()
	{
		if (!Mouse.isDown(MouseButton.Left) || this._selected === undefined)
		{
			return;
		}

		var movement = Mouse.movement();
		var p = this._camera.mouseToWorld();

		var offset = this._offsets[this._selected];
		var o = {
			x: offset.x / this._offset * this._speed,
			y: offset.y / this._offset * this._speed,
			z: offset.z / this._offset * this._speed
		};

		this._root.translateBy((p.x - this._startPosition.x) * o.x * 4, movement.y * o.y * -1, (p.z - this._startPosition.z) * -o.z * 4);

		this._startPosition = this._camera.mouseToWorld();
	},

	onUpdate: function()
	{
		this.move();
	}
});