var AStar = AStar || {};

_.extend(AStar, {
	_grid: [],

	setGrid: function (grid, size)
	{
		this._grid = grid;
		this._gridSize = size;
	},

	ManhattanDistance: function(point, goal)
	{
		return Math.abs(point.x - goal.x) + Math.abs(point.y - goal.y);
	},

	DiagonalDistance: function (point, goal)
	{
		return Math.max(Math.abs(point.x - goal.x), Math.abs(point.y - goal.y));
	},

	EuclideanDistance: function (point, goal)
	{
		return Math.sqrt(Math.pow(point.x - goal.x, 2) + Math.pow(point.y - goal.y, 2));
	},

	getNeighbours: function (node)
	{
		var neighbours = [];

		if (node.x - 1 >= 0) 
			neighbours.push({ x: node.x - 1, y: node.y });

		if (node.x + 1 < this._gridSize) 
			neighbours.push({ x: node.x + 1, y: node.y });

		if (node.y - 1 >= 0) 
			neighbours.push({ x: node.x, y: node.y - 1 });

		if (node.y + 1 < this._gridSize) 
			neighbours.push({ x: node.x, y: node.y + 1 });

		if (node.x + 1 < this._gridSize && node.y + 1 < this._gridSize)
			neighbours.push({ x: node.x + 1, y: node.y + 1 });

		if (node.x + 1 < this._gridSize && node.y - 1 >= 0)
			neighbours.push({ x: node.x + 1, y: node.y - 1 });
		
		if (node.x - 1 >= 0 && node.y - 1 >= 0)
			neighbours.push({ x: node.x - 1, y: node.y - 1 });
		
		if (node.x - 1 >= 0 && node.y + 1 < this._gridSize)
			neighbours.push({ x: node.x - 1, y: node.y + 1 });

		for (var i = neighbours.length - 1; i >= 0; i--)
		{
			if (this._grid[neighbours[i].y][neighbours[i].x] === false)
			{
				neighbours.splice(i, 1);
			}
		}

		return neighbours;
	},

	createNode: function (parent, pos)
	{
		return {
			parent: parent,
			value: pos.x + pos.y * this._gridSize,
			x: pos.x,
			y: pos.y,
			f: 0,
			g: 0
		};
	},

	findPath: function (start, end, heuristic)
	{
		var startNode = this.createNode(null, start);
		var endNode = this.createNode(null, end);

		var openNodes = [startNode];
		var closedNodes = [];

		var world = new Array(this._gridSize * this._gridSize);
		var fullPath = [];

		var currentNeighbours, currentNode, currentPath;
		var openNodesLength, maxF, idx, i;

		while (openNodesLength = openNodes.length)
		{
			maxF = this._gridSize * this._gridSize;
			idx = -1;

			for (i=0; i < openNodesLength; i++)
			{
				if (openNodes[i].f < maxF)
				{
					maxF = openNodes[i].f;
					idx = i;
				}
			}

			currentNode = openNodes.splice(idx, 1)[0];

			// Is the current node the end node?
			if (currentNode.value !== endNode.value)
			{
				// Nope, current node is NOT the end of the path

				currentNeighbours = this.getNeighbours(currentNode);

				for (i = 0; i < currentNeighbours.length; i++)
				{
					currentPath = this.createNode(currentNode, currentNeighbours[i]);
					
					// is the current end node of the path already processed?
					if (!world[currentPath.value])
					{
						// nope, process it
						world[currentPath.value] = true;
						currentPath.g = currentNode.g + heuristic(currentNeighbours[i], currentNode);
						currentPath.f = currentPath.g + heuristic(currentNeighbours[i], endNode);
						openNodes.push(currentPath);
					}

					closedNodes.push(currentNode);
				}
			}
			else
			{
				// Yep, current node is the end of the path
				currentPath = closedNodes[closedNodes.push(currentNode) - 1];

				do {
					fullPath.push({x:currentPath.x, y: currentPath.y});
				} while (currentPath = currentPath.parent);

				fullPath.reverse();

				world = [];
				openNodes = [];
				closedNodes = [];
			}
		}

		return fullPath;
	}
});