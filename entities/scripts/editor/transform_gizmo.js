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
	this._axis.z.setRotation(0, -Math.PI / 2, Math.PI / 2);

	this._offset = 4;
	this._offsets = {
		x: Vector3D.construct(this._offset, 0, 0),
		y: Vector3D.construct(0, this._offset, 0),
		z: Vector3D.construct(0, 0, this._offset)
	}

	this._colours = {
		x: [1, 0, 0],
		y: [0, 1, 0],
		z: [0, 0, 1]	
	}

	this._radius = 2;
	this._editor = params.editor;
	this._camera = this._editor.camera();
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

	this._attachedTo = undefined;
	this._root.setAlpha(0.5);
	this._root.setScale(0.33, 0.33, 0.33);

	this._rotation = Vector3D.construct(0, 0, 0);
}

_.inherit(TransformGizmo, Entity);

_.extend(TransformGizmo.prototype, {
	setPosition: function(x, y, z)
	{
		this._root.setTranslation(x, y, z);
	},

	attachTo: function(child)
	{
		this._attachedTo = child;
	},

	check: function(ray)
	{
		if (this._selected !== undefined && Mouse.isDown(MouseButton.Left))
		{
			return;
		}
		else if (Mouse.isDown(MouseButton.Left))
		{
			return;
		}

		if (this._editor.currentGizmo() !== this && this._editor.currentGizmo() !== undefined)
		{
			return
		}

		this._selected = undefined;
		var t = this._root.translation();
		var found = undefined;
		var c;
		var axis;
		var intersection;
		var lowest = undefined;

		for (var i in this._axis)
		{
			axis = this._axis[i];
			c = this._colours[i];
			axis.setBlend(c[0], c[1], c[2]);
			intersection = Ray.sphereIntersection(ray, Vector3D.add(this._root.translation(), this._offsets[i]), this._radius);

			if (intersection !== false)
			{
				if (lowest === undefined || intersection < lowest)
				{
					lowest = intersection;
					found = axis;
					this._selected = i;
				}
			}
		}

		if (found !== undefined)
		{
			this._editor.addInputDisable(InputDisable.Gizmo);
			this._editor.setCurrentGizmo(this);

			found.setBlend(1, 1, 1);
			this._startPosition = this._camera.mouseToWorld();
			this._root.setAlpha(1);
		}
		else
		{
			this._editor.removeInputDisable(InputDisable.Gizmo);
			this._editor.setCurrentGizmo(undefined);
			this._root.setAlpha(0.5);
		}
	},

	move: function(dt)
	{
		if (this._selected === undefined)
		{
			return;
		}
		
		if (Keyboard.isDown(Key.Z))
		{
			var s = this._attachedTo.scale();
			s.x = Math.max(0.05, s.x - dt);
			s.y = Math.max(0.05, s.y - dt);
			s.z = Math.max(0.05, s.z - dt);

			this._attachedTo.setScale(s.x, s.y, s.z);
			return;
		}
		else if (Keyboard.isDown(Key.X))
		{
			var s = this._attachedTo.scale();

			this._attachedTo.setScale(s.x + dt, s.y + dt, s.z + dt);
		}

		if (!Mouse.isDown(MouseButton.Left))
		{
			return;
		}

		var movement = Mouse.movement();
		var p = this._camera.mouseToWorld();

		if (Keyboard.isDown(Key.Control))
		{
			var speed = movement.x / 40;
			this._rotation[this._selected] += speed;

			this._attachedTo.setRotation(this._rotation.x, this._rotation.y, this._rotation.z);

			return;
		}

		var offset = this._offsets[this._selected];
		var o = {
			x: offset.x / this._offset * this._speed,
			y: offset.y / this._offset * this._speed,
			z: offset.z / this._offset * this._speed * -1
		};

		if (this._camera.projectRay().direction.y > 0)
		{
			o.x *= -1;
			o.z *= -1;
		}

		this._root.translateBy((p.x - this._startPosition.x) * o.x * 4, movement.y * o.y * -1, (p.z - this._startPosition.z) * -o.z * 4);
		
		var t = this._root.translation();
		this._attachedTo.setTranslation(t.x, t.y, t.z);

		this._startPosition = this._camera.mouseToWorld();
	},

	onUpdate: function(dt)
	{
		if (this._attachedTo === undefined)
		{
			for (var i in this._axis)
			{
				this._axis[i].setBlend(0.3, 0.3, 0.3);
			}

			return;
		}

		this.check(this._camera.projectRay());
		this.move(dt);
	}
});