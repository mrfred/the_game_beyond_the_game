// GLOBALS
var camera, scene, renderer;

var world;
var player;
var model;
var acceleration;
var fullThrottle;
var isBlocked;

// Defines
var PLAYER_SPEED = 3;

var WOLRD_TILE_SIZE = 75; 

// ADD EVENT HANDLER
document.addEventListener("keydown", keydownEvent, false);
document.addEventListener("keyup", keyupEvent, false);
//document.addEventListener( 'mousemove', onMouseMove, false );
// document.addEventListener( 'mousedown', onMouseDown, false );
// document.addEventListener( 'mouseup', onMouseUp, false );
// document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
// document.addEventListener( 'DOMMouseScroll', onDocumentMouseWheel, false );

function keydownEvent(e)
{
	if (isBlocked == true)
		return;

	// arrow left
	if (e.keyCode == "37") {
		player.translateX(-PLAYER_SPEED);
        cube.rotation.z = Math.PI/2;
        //rotateTank("left");
    }
    // up
    else if (e.keyCode == "38") {
        player.translateY(PLAYER_SPEED);
        cube.rotation.z = 0;
        //accelerateTank();
    }
    // right
    else if (e.keyCode == "39") {
        player.translateX(PLAYER_SPEED);
        cube.rotation.z = - Math.PI/2;
        //rotateTank("right");
    }
    // down
    else if (e.keyCode == "40") {
        cube.rotation.z = Math.PI;
        player.translateY(-PLAYER_SPEED);
        //breakTank();
    }
    // space
    else if (e.keyCode == "32") {
        fire();
    }
}

function keyupEvent(e)
{
	if (e.keyCode == "38") {
		fullThrottle = false;
	}
}

function breakTank()
{
	acceleration = 0;
}

function accelerateTank()
{
	fullThrottle = true;
	if (acceleration < 10.0)
		acceleration = acceleration + 0.05;
	//cube.translateX(1 * fullThrottle);
}

function moveTank()
{
	if (acceleration > 0)
	{
		cube.translateY(1 * acceleration);
		acceleration = acceleration - 0.01;
	}
}

function rotateTank(direction)
{
	if (direction == "left")
		cube.rotateOnAxis(new THREE.Vector3(0, 0, 1), 0.1);
	else
		cube.rotateOnAxis(new THREE.Vector3(0, 0, 1), -0.1);
}

/**
 * initilization
 * @return {[type]} [description]
 */
function init() 
{
	world = new Array();

	//camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
	//camera.position.z = 5;

	// init three.js stuff
	camera = new THREE.OrthographicCamera( 
		window.innerWidth / - 2, window.innerWidth / 2,
		window.innerHeight / 2, window.innerHeight / - 2,
		 1, 10000 );

	//camera.position.z = 300;

	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer();

	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	// draw grid
	//drawGrid();
	//
	fullThrottle = 0;
	acceleration = 0;
	isBlocked = false;

	createRandomDungeon();

	createPlayer();
	player.translateY(50);
	player.translateX(50);

	createLight();

	// GO!!
	animate();
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
				child.translateY(5);
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

	for (var y = 0; y < Dungeon.map_size; y++) 
	{
        for (var x = 0; x < Dungeon.map_size; x++)
        {
        	var tile = Dungeon.map[x][y];

        	if (tile == 1)
        	{
        		createGround(x, y, 100, 100);
        	}
        	else if (tile == 2)
        	{
        		createWall(x, y);
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

function createPlayer()
{
	player = new THREE.Object3D();

	var geometry = new THREE.CubeGeometry( 20, 20, 10 );
	var material = new THREE.MeshLambertMaterial( {color: 0x00ff00} );
	cube = new THREE.Mesh( geometry, material );

	geometry = new THREE.CubeGeometry( 7.5, 20, 10 );
	material = new THREE.MeshLambertMaterial( {color: 0x00ff00} );
	gun = new THREE.Mesh( geometry, material );
	gun.translateY(15); 
	//player.position = new THREE.Vector3(100, 100, 100);

	cube.add(gun);
	cube.translateZ(5);

	player.add(cube);
	player.add(camera);

	//cube.add(camera);

	// adjust camera position
	camera.position.z = camera.position.z + 500;
	camera.position.y = camera.position.y - 500;
	camera.lookAt(player.position);

	scene.add( player );
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
	moveTank();
	moveRockets();
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

function detectTankCollision()
{
	var vector = getDirection(cube);
	var ray = new THREE.Raycaster(player.position, vector);
	var intersects = ray.intersectObjects(world, false);

	if (intersects.length > 0) 
	{
	    if (intersects[0].distance < 30) 
	    {
	    	isBlocked = true;
	      //breakTank();
	    }
	    else
	    {
	    	isBlocked = false;
	    }
	}
}

function getIntersections()
{
	
}

function detectRocketCollision()
{

}

function getDirection(mesh)
{
	var matrix = new THREE.Matrix4();
	matrix.extractRotation( cube.matrixWorld );

	var direction = new THREE.Vector3( 1, 1, 0 );
	direction.applyMatrix4(matrix);

	return direction;
}