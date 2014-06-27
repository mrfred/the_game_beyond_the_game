// GLOBALS
var camera, scene, renderer;

// world
var world;
var grid;

// player 
var player;
var startPos;
var buildPath;
var marker;

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
	marker = new Array();
	grid = [];

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

    worldCoordinatesUtils.getWorldCoordinates(canvasPos, worldPos);
    //console.log(destination);

    player.lookAt(worldPos);
    //rotatePlayer(worldPos);

	var nextPosition = new THREE.Vector3();
	nextPosition.x = Math.round(worldPos.x);
	nextPosition.y = Math.round(worldPos.y);

    // if (event.button == 0)
    // {
    // 	if (player.isDirectPath(worldPos, world))
    // 	{
    // 		player.destination.x = Math.round(worldPos.x);
    // 		player.destination.y = Math.round(worldPos.y);
    // 	}
    // }
    // else
    if (buildPath == true)
    {
    	addMarker(nextPosition, 0x00ff00);
    	player.addPath(nextPosition);		
    }
    else
    {
    	addMarker(nextPosition, 0x0000ff);	
    	player.calculatePath(nextPosition, world);
    	//player.destination = player.object3d.position.clone();
    }
}

function addMarker(position, color)
{
	// draw circle
	var material = new THREE.MeshBasicMaterial({ color: color });
	var radius = 5;
	var segments = 32;
	var circleGeometry = new THREE.CircleGeometry( radius, segments );
	var circle = new THREE.Mesh( circleGeometry, material );

	circle.position = position;
	circle.position.z = 1;

	scene.add( circle );

	// draw line between circles
	if (marker.length > 0)
	{
		prevMarkerPosition = marker[marker.length - 1];

		var material = new THREE.LineBasicMaterial({ color: color });
		var geometry = new THREE.Geometry();
		
		geometry.vertices.push( prevMarkerPosition );
		geometry.vertices.push( position );
		
		var line = new THREE.Line( geometry, material ); 
		
		scene.add( line );
	}
	marker.push( position );
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
	Dungeon.Generate();

	for (var x = 0; x < Dungeon.map_size; x++) 
	{
		grid[x] = [];	
        for (var y = 0; y < Dungeon.map_size; y++)
        {
        	var tile = Dungeon.map[x][y];

        	if (tile == 1)
        	{
        		createGround(x, y, 100, 100);
        		grid[x][y] = 0;
        	}
        	else if (tile == 2)
        	{
        		createWall(x, y);
        		grid[x][y] = 1;
        	}
        	else
        	{
        		grid[x][y] = 1;
        	}
        }
    }

}

function createWall(x, y)
{
	var geometry = new THREE.CubeGeometry( WOLRD_TILE_SIZE, WOLRD_TILE_SIZE, WOLRD_TILE_SIZE / 2 );
	var material = new THREE.MeshLambertMaterial( {color: 0x778899} );
	var wall = new THREE.Mesh( geometry, material );

	wall.position.x = x * WOLRD_TILE_SIZE;
	wall.position.y = y * WOLRD_TILE_SIZE;

	world.push( wall );
	scene.add( wall );
}

function createGround(x, y, w, h)
{
	var geometry = new THREE.PlaneGeometry( w, h, 1 );
	var material = new THREE.MeshLambertMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
	var plane = new THREE.Mesh( geometry, material );

	plane.position.x = x * WOLRD_TILE_SIZE;
	plane.position.y = y * WOLRD_TILE_SIZE;
	scene.add( plane );
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