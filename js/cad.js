// GLOBALS
var camera, scene, renderer;

var world;
var player;
var model;
var startPos;
var cameraRefPos;
var grid;

var canvasPos;
var worldPos;
var destination;

// Defines
var PLAYER_SPEED = 1;

var WOLRD_TILE_SIZE = 100; 

// ADD EVENT HANDLER
document.addEventListener("keydown", keydownEvent, false);
//document.addEventListener("keyup", keyupEvent, false);
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
	grid = [];

	worldCoordinatesUtils = new WorldCoordinatesUtils();
	canvasPos = new THREE.Vector2(0, 0);

	// init three.js stuff
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer();

	camera = new THREE.OrthographicCamera( 
		window.innerWidth / - 2, window.innerWidth / 2,
		window.innerHeight / 2, window.innerHeight / - 2,
		 1, 10000 );

	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	// create game
	createRandomDungeon();
	createPlayer();
	createLight();

	// adjust camera
	cameraRefPos = new THREE.Object3D();
	cameraRefPos.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI * 0.25);
	cameraRefPos.add(camera);

	camera.position.z = camera.position.z + 500;
	camera.position.y = camera.position.y - 500;
	camera.lookAt(player.position);

	player.add(cameraRefPos);

	startPos = new THREE.Vector3(100, 100, 5);
	player.position = startPos.clone();
	destination = player.position.clone();
	worldPos = player.position.clone();

	// GO!!
	animate();
}

function createPlayer()
{
	player = new THREE.Object3D();

	var geometry = new THREE.CubeGeometry( 20, 20, 10 );
	var material = new THREE.MeshLambertMaterial( {color: 0x00ff00} );
	cube = new THREE.Mesh( geometry, material );

	geometry = new THREE.CubeGeometry( 20, 7.5, 10 );
	material = new THREE.MeshLambertMaterial( {color: 0x00ff00} );
	gun = new THREE.Mesh( geometry, material );
	gun.translateX(15); 

	cube.add(gun);
	//cube.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI * 1.0);

	cube.translateZ(5);
	
	player.add(cube);
	scene.add( player );
}


// WorldCoordinatesUtils
function WorldCoordinatesUtils()
{
	this.planeZ = new THREE.Plane( new THREE.Vector3( 0, 0, 1 ), 0 );
	this.mv = new THREE.Vector3( 0, 0, 0.5 );
	this.projector = new THREE.Projector();
}

WorldCoordinatesUtils.prototype.getWorldCoordinates = function(mousePosition, worldPosition)
{	
	this.mv.x = mousePosition.x;
	this.mv.y = mousePosition.y;

	var raycaster = this.projector.pickingRay(this.mv, camera);
	var pos = raycaster.ray.intersectPlane(this.planeZ);

	worldPosition.x = pos.x;
	worldPosition.y = pos.y;
};

function keydownEvent(e)
{
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
}

function onMouseDown( event )
{
	canvasPos.x = (event.clientX / window.innerWidth) * 2 - 1;
    canvasPos.y = -(event.clientY / window.innerHeight) * 2 + 1;

    worldCoordinatesUtils.getWorldCoordinates(canvasPos, worldPos);
    //console.log(destination);

    rotatePlayer(worldPos);

    if (event.button == 0)
    {
    	if (isDirectPath(player, worldPos))
    	{
    		destination.x = Math.round(worldPos.x);
    		destination.y = Math.round(worldPos.y);
    	}
    }
    else
    {
    	destination = player.position.clone();
    }
}

function rotatePlayer(clickPosition)
{
	var direction = getDirection(cube);
    //console.log(direction);

    var mouseDir = clickPosition.clone().sub(player.position);
    //console.log(mouseDir);

    var angle = direction.angleTo(mouseDir);
    //console.log(angle);

	var right = new THREE.Vector3();
    right.crossVectors(direction, new THREE.Vector3(0, 0, 1));
    //console.log(right);

    var dot = right.dot(mouseDir);
    //console.log(dot);
    if (dot < 0)
    	cube.rotateOnAxis(new THREE.Vector3(0, 0, 1), angle);
    else
    	cube.rotateOnAxis(new THREE.Vector3(0, 0, 1), -angle);
}

function movePlayer()
{
	if (player.position.distanceTo(destination) > 1)
		player.translateOnAxis(getDirection(cube), 2);
}

function createLight()
{
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9 );
	directionalLight.position.set( 0, 1, 10000 );

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
	detectCollision();
	movePlayer();
	//moceCamera();
	moveRockets();
}

function moveCamera()
{
	
}

function render()
{
	renderer.render( scene, camera );
}

function detectCollision()
{
	detectTankCollision();
	//console.debug("direction: " + vector.x + " " + vector.y + " " + vector.z);
}

function isDirectPath(player, clickPosition)
{
	var isDirectPath = true;
	var direction = getDirection(cube);
	var ray = new THREE.Raycaster(player.position, direction);
	var intersects = ray.intersectObjects(world, false);
	var pathDistance = player.position.distanceTo(clickPosition);

	//console.log(player.position);
	console.log(intersects[0].distance + " " + pathDistance)

	if (intersects.length > 0) 
		if (intersects[0].distance < pathDistance) 
	    	isDirectPath = false;

	return isDirectPath;
}

function findPath(player, clickPosition)
{

}

function detectTankCollision()
{
	var vector = getDirection(cube);
	var ray = new THREE.Raycaster(player.position, vector);
	var intersects = ray.intersectObjects(world, false);

	if (intersects.length > 0) 
	{
	    if (intersects[0].distance < 30) 
	    {
	    	destination = player.position.clone();
	    }
	}
}

function detectRocketCollision()
{

}

function getDirection(mesh)
{
	var matrix = new THREE.Matrix4();
	matrix.extractRotation( mesh.matrixWorld );

	var direction = new THREE.Vector3( 1, 0, 0 );
	direction.applyMatrix4(matrix);

	return direction;
}