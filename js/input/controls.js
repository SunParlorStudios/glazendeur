require('js/input/keybinding');

Enum("Bindings", [
	"WalkCommand"
]);

Enum("InputDevice", [
	"Keyboard",
	"Mouse"
]);

var Controls = Controls || {};

_.extend(Controls, {
	_bindings: {
		WalkCommand: new KeyBinding(InputDevice.Mouse, MouseButton.Left)
	},

	_parseBinding: function (id)
	{
		var i = 0;
		for (var k in this._bindings)
		{
			if (i++ == id)
			{
				return this._bindings[k];
			}
		}

		return false;
	},

	_parseDevice: function (id)
	{
		switch (id)
		{
			case InputDevice.Mouse:
				return Mouse;
				break;
			case InputDevice.Keyboard:
				return Keyboard;
				break;
		}
	},

	saveBinds: function ()
	{
		var parsed = JSON.stringify(this._bindings);
		IO.write('json/bindings.json', parsed);
	},

	loadBinds: function ()
	{
		if (IO.exists('json/bindings.json'))
		{
			var loaded = JSON.parse(IO.read('json/bindings.json'));
			this._bindings = loaded;

			return true;
		}
		else
		{
			// if there is nothing to be loaded, we save the defaults
			this.saveBinds();
		}

		return false;
	},

	setBinding: function (binding, key)
	{
		if (binding === undefined || key === undefined) // no simple inverse-check because 0==false
			return Log.error("Button binding and a map need to be valid");

		var i = 0;

		for (var k in this._bindings)
		{
			if (i++ == binding)
			{
				this._bindings[k] = key;
			}
		}
	},

	isBoundByCommand: function (binding)
	{
		return !!this._bindings[binding];
	},

	isBoundByKey: function (key, inputDevice)
	{
		if (!key || !inputDevice)
			return Log.error('Key and/or input device are not set');

		for (var k in this._bindings)
		{
			if (this._bindings[k].device === inputDevice && this._bindings[k].key === key)
			{
				return true;
			}
		}

		return false;
	},

	isDown: function (command)
	{
		var binding = this._parseBinding(command);

		if (!binding)
			return Log.error("Command is not bound to any button");

		return this._parseDevice(binding.device).isDown(binding.key);
	},
	
	isPressed: function (command)
	{
		var binding = this._parseBinding(command);

		if (!binding)
			return Log.error("Command is not bound to any button");

		return this._parseDevice(binding.device).isPressed(binding.key);
	},
	
	isReleased: function (command)
	{
		var binding = this._parseBinding(command);

		if (!this._bindings[command])
			return Log.error("Command is not bound to any button");

		return this._parseDevice(binding.device).isReleased(binding.key);
	},
});

Controls.loadBinds();