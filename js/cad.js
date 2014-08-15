// GLOBALS
var camera, scene, renderer;

// world
var world;
var ground;

// pathfinding
var grid;
var finder;

// player 
var player;
var startPos;
var buildPath;
var marker;
var currentMarker;

// camera
var cameraRefPos;

// position handling
var canvasPos;
var worldPos;

// Defines
var PLAYER_SPEED = 1;
var WOLRD_TILE_SIZE = 100; 

// ADD EVENT HANDLER
document.addEventListener("keydown", keydownEvent, false);
document.addEventListener("keyup", keyupEvent, false);
//document.addEventListener( 'mousemove', onMouseMove, false );
document.addEventListener( 'mousedown', onMouseDown, false );
// document.addEventListener( 'mouseup', onMouseUp, false );
// document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
// document.addEventListener( 'DOMMouseScroll', onDocumentMouseWheel, false );

/**
 * initilization
 * @return {[type]} [description]
 */
function init() 
{
	world = new Array();
	ground = new Array();
	marker = new Array();
	currentMarker = null;

	worldCoordinatesUtils = new WorldCoordinatesUtils();
	canvasPos = new THREE.Vector2(0, 0);

	// init three.js stuff
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer();

	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	// create game
	createRandomDungeon();
	player = new Player();
	scene.add(player.object3d);
	buildPath = false;
	
	createCamera(player);
	createLight();

	// set start position
	startPos = new THREE.Vector3(100, 100, 5);
	player.object3d.position = startPos.clone();
	
	player.destination = player.object3d.position.clone();
	worldPos = player.object3d.position.clone();

	// GO!!
	animate();
}

function createCamera(player)
{
	camera = new THREE.OrthographicCamera( 
		window.innerWidth / - 2, window.innerWidth / 2,
		window.innerHeight / 2, window.innerHeight / - 2,
		 1, 10000 );

	// adjust camera
	cameraRefPos = new THREE.Object3D();
	cameraRefPos.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI * 0.25);
	cameraRefPos.add(camera);

	camera.position.z = camera.position.z + 500;
	camera.position.y = camera.position.y - 500;
	camera.lookAt(player.object3d.position);

	player.object3d.add(cameraRefPos);
}

function keydownEvent(e)
{
	//console.log("keycode :" + e.keyCode);

	// arrow left
	if (e.keyCode == "37") {
        cameraRefPos.rotateOnAxis(new THREE.Vector3(0, 0, 1), 0.1);
    }
    // up
    else if (e.keyCode == "38") {
        cameraRefPos.translateZ(1);
    }
    // right
    else if (e.keyCode == "39") {
        cameraRefPos.rotateOnAxis(new THREE.Vector3(0, 0, 1), - 0.1);
    }
    // down
    else if (e.keyCode == "40") {
        cameraRefPos.translateZ(-1);
    }
    // space
    else if (e.keyCode == "32") {
        fire();
    }
    else if (e.keyCode == "17") {
    	buildPath = true;
    }
}

function keyupEvent(e)
{
	if (e.keyCode == "17") {
    	buildPath = false;
    	marker.length = 0;
    }
}

function onMouseDown( event )
{
	canvasPos.x = (event.clientX / window.innerWidth) * 2 - 1;
    canvasPos.y = -(event.clientY / window.innerHeight) * 2 + 1;

    worldPos = worldCoordinatesUtils.getWorldCoordinates(canvasPos);

	var nextPosition = new THREE.Vector3();
	nextPosition.x = Math.round(worldPos.x);
	nextPosition.y = Math.round(worldPos.y);

    if (buildPath == true)
    {
    	addMarker(nextPosition, 0x00ff00, true);
    	player.addPath(nextPosition);		
    }
    else
    {
    	if (player.isDirectPath(nextPosition, world))
    	{
    		addMarker(nextPosition, 0x0000ff, false);	
    		player.lookAt(worldPos);
    		player.currentPathDestination = nextPosition;
    	}
    	else
    	{
    		calcPath(canvasPos);
    		//player.calculatePath(nextPosition, world);
    	}
    }
    //calcPath(canvasPos);
}

function isInsideTile(element)
{
	var elemPosX = element.position.x;
	var elemPosY = element.position.y;
	var elemHeight = element.geometry.height;
	var elemWidth = element.geometry.width;

	var posX = player.object3d.position.x;
	var posY = player.object3d.position.y;

	if ((posX >= elemPosX && posX < (elemPosX + elemWidth)) && (posY >= elemPosY && posY < (elemPosY + elemHeight)))
		return true;
	else
		return false;
}

function calcPath(mousePosition)
{
	var endGroundTile = worldCoordinatesUtils.getWorldObject(mousePosition, ground);
	var startGroundTile = ground.filter(isInsideTile)[0];

	var startX = startGroundTile.position.x / WOLRD_TILE_SIZE;
	var startY = startGroundTile.position.y / WOLRD_TILE_SIZE;
	
	var endX = endGroundTile.position.x / WOLRD_TILE_SIZE;
	var endY = endGroundTile.position.y / WOLRD_TILE_SIZE;

	//gridBackUp = grid.clone();
	var path = finder.findPath(startX, startY, endX, endY, grid.clone());
	var newPath = PF.Util.compressPath(path);
	//var newPath = PF.Util.smoothenPath(grid, path);

	//console.log(path);

	for (i = 0; i < marker.length; i++)
	{
		scene.remove(marker[i]);
		marker[i] = null;
	}
	marker.length = 0;

	player.currentPathDestination = null;
	player.path.length = 0;

	for (i = 1; i < newPath.length; i++)
	{
		var nextPosition = new THREE.Vector3();
		
		nextPosition.x = newPath[i][0] * WOLRD_TILE_SIZE;
		nextPosition.y = newPath[i][1] * WOLRD_TILE_SIZE;
		
		addMarker(nextPosition, 0x00ff00, true);
		player.addPath(nextPosition);
	}
}

function addMarker(position, color, drawLine)
{
	if (drawLine == false)
	{
		if (currentMarker == null)
		{
			currentMarker = createMarker( color );
			scene.add( currentMarker );
		}
		currentMarker.position = position;
		currentMarker.position.z = 1;
	}
	else
	{
		scene.remove( currentMarker );
		currentMarker = null;

		var pathMarker = createMarker( color );
		scene.add( pathMarker );
		pathMarker.position = position;
		pathMarker.position.z = 1;

		// draw line between circles
		if (marker.length > 0)
		{
			prevMarkerPosition = marker[marker.length - 1];
			var line = createLine( prevMarkerPosition, position, color );
					
			scene.add( line );
		}
		marker.push( position );
	}
}

function createMarker(color)
{
	// draw circle
	var material = new THREE.MeshBasicMaterial({ color: color });
	var radius = 5;
	var segments = 32;
	var circleGeometry = new THREE.CircleGeometry( radius, segments );
	var circle = new THREE.Mesh( circleGeometry, material );

	return circle;
}

function createLine(start, end, color)
{
	var material = new THREE.LineBasicMaterial({ color: color });
	var geometry = new THREE.Geometry();
	
	geometry.vertices.push( start );
	geometry.vertices.push( end );
	
	var line = new THREE.Line( geometry, material ); 

	return line;
}

function createLight()
{
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9 );
	directionalLight.position.set( 0,

	 1, 10000 );

	scene.add( directionalLight );
}

function fire()
{
	var geometry = new THREE.CubeGeometry( 10, 10, 10 );
	var material = new THREE.MeshLambertMaterial( {color: 0x00ff00} );
	var rocket = new THREE.Mesh( geometry, material );
	var userData = new Object();

	userData["lifeTime"] = 50;
	rocket.name = "rocket";
	rocket.userData = userData;

	rocket.applyMatrix(cube.matrixWorld);
	scene.add(rocket);

	//console.debug(cube.children.length)
	//console.debug("lifeTime" + rocket.userData["lifeTime"]);
}

function moveRockets()
{
	var child;
	//console.debug(scene.children.length);

	for (var i = 0; i < scene.children.length; i++)
	{
		child = scene.children[i];
		//console.debug(child);
		if (child.name == "rocket")
		{
			if (child.userData["lifeTime"] > 0)
			{
				child.translateX(5);
				//console.debug("time: " + child.userData["lifeTime"]);
				child.userData["lifeTime"] = child.userData["lifeTime"] - 1;
			}
			else
			{
				scene.remove(child);
			}
		}
	}
}

function deleteTempObjects()
{
	var child;
	//console.debug(scene.children.length);

	for (var i = 0; i < scene.children.length; i++)
	{
		child = scene.children[i];
		//console.debug(child);
		if (child.name == "temp")
		{
			if (child.userData["lifeTime"] > 0)
			{
				child.userData["lifeTime"] = child.userData["lifeTime"] - 1;
			}
			else
			{
				scene.remove(child);
			}
		}
	}	
}

function createRandomDungeon()
{
	var tempMatrix = [];

	Dungeon.Generate();
	DungeonStructures.tileSize = WOLRD_TILE_SIZE;
	grid = new PF.Grid(128, 128);

	for (var x = 0; x < Dungeon.map_size; x++) 
	{	
        for (var y = 0; y < Dungeon.map_size; y++)
        {
        	var tile = Dungeon.map[x][y];

        	if (tile == 1)
        	{
        		var groundTile = DungeonStructures.CreateGround(x, y, 100, 100);
				ground.push( groundTile );
				scene.add( groundTile );
        	}
        	else if (tile == 2)
        	{
        		var wallTile = DungeonStructures.CreateWall(x, y);
        		world.push( wallTile );
        		scene.add( wallTile );

        		grid.setWalkableAt(x, y, false);
        	}
        	else if (tile == 0)
        	{
        		grid.setWalkableAt(x, y, false);
        	}
        }
    }

    finder = new PF.AStarFinder({
    	allowDiagonal: false,
	    dontCrossCorners: true
	});
}

function animate()
{
    requestAnimationFrame( animate );
	render();	
	update();
}

function update()
{
	if (buildPath != true)
		player.moveOnPath();
	player.detectCollision(world);
	//moceCamera();
	//moveRockets();
}

function moveCamera()
{
	
}

function render()
{
	renderer.render( scene, camera );
}