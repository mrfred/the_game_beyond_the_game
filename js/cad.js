// GLOBALS
var camera, scene, renderer;

var world;
var player;
var model;
var startPos;

var cameraRefPos;
var canvasPos; 
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

	//camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
	//camera.position.z = 5;
	worldCoordinatesUtils = new WorldCoordinatesUtils();
	canvasPos = new THREE.Vector2(0, 0);

	// init three.js stuff
	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer();

	camera = new THREE.OrthographicCamera( 
		window.innerWidth / - 2, window.innerWidth / 2,
		window.innerHeight / 2, window.innerHeight / - 2,
		 1, 10000 );

	//cameraRefPos = new THREE.Vector3(0, 0, 0);
	cameraRefPos = new THREE.Object3D();
	cameraRefPos.position = new THREE.Vector3(0, 0, 0);
	cameraRefPos.add(camera);

	scene.add(cameraRefPos);

	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	createRandomDungeon();
	createPlayer();
	createLight();

//cameraRefPos.add(camera);


	// adjust camera
	camera.position.z = camera.position.z + 500;
	camera.position.y = camera.position.y - 500;
	camera.lookAt(cameraRefPos.position);


	startPos = new THREE.Vector3(100, 100, 5);
	player.position = startPos.clone();
	cameraRefPos.position = startPos.clone();


	destination = player.position.clone();

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
	//player.add(camera);

	//camera.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI * 1.75);

	// adjust camera position
	//camera.position.z = camera.position.z + 500;
	//camera.position.y = camera.position.y - 500;
	//camera.position.x = camera.position.x - 500;

	//camera.rotation.z = - Math.PI;

	//camera.lookAt(player.position);
	//camera.position.z = camera.position.z + 500;

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
		//player.translateX(-PLAYER_SPEED);
        camera.rotateOnAxis(new THREE.Vector3(0, 0, 1), 0.1);
        //rotateTank("left");
    }
    // up
    else if (e.keyCode == "38") {
        //player.translateY(PLAYER_SPEED);
        camera.rotation.z = 0;
        //accelerateTank();
    }
    // right
    else if (e.keyCode == "39") {
        //player.translateX(PLAYER_SPEED);
        camera.rotateOnAxis(new THREE.Vector3(0, 0, 1), - 0.1);
        //rotateTank("right");
    }
    // down
    else if (e.keyCode == "40") {
        camera.rotation.z = Math.PI;
        //player.translateY(-PLAYER_SPEED);
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

function onMouseDown( event )
{
	canvasPos.x = (event.clientX / window.innerWidth) * 2 - 1;
    canvasPos.y = -(event.clientY / window.innerHeight) * 2 + 1;

    worldCoordinatesUtils.getWorldCoordinates(canvasPos, destination);
    destination.x = Math.round(destination.x);
    destination.y = Math.round(destination.y);
    //console.log(destination);

    var direction = getDirection(cube);
    //console.log(direction);

    var mouseDir = destination.clone().sub(player.position);
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
	{
		//console.log(player.position.distanceTo(cameraRefPos.position))
		if (player.position.distanceTo(cameraRefPos.position) > 150
			&& destination.distanceTo(cameraRefPos.position) > 150)
		{
			cameraRefPos.translateOnAxis(getDirection(cube), 2);
		}
		player.translateOnAxis(getDirection(cube), 2);
	}
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