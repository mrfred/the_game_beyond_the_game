// GLOBALS

var camera, scene, renderer;

var world;
var cube;
var acceleration;
var fullThrottle;


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
	// arrow left
	if (e.keyCode == "37") {
         rotateTank("left");
    }
    // up
    else if (e.keyCode == "38") {
        accelerateTank();
    }
    // right
    else if (e.keyCode == "39") {
        rotateTank("right");
    }
    // down
    else if (e.keyCode == "40") {
        breakTank();
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

	camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000);
	//camera.position.z = 5;

	// init three.js stuff
	// camera = new THREE.OrthographicCamera( 
	// 	window.innerWidth / - 2, window.innerWidth / 2,
	// 	window.innerHeight / 2, window.innerHeight / - 2,
	// 	 0, 10000 );

	camera.position.z = 30;

	scene = new THREE.Scene();
	renderer = new THREE.WebGLRenderer();

	renderer.setSize( window.innerWidth, window.innerHeight );
	document.body.appendChild( renderer.domElement );

	// draw grid
	//drawGrid();
	//
	fullThrottle = 0;
	acceleration = 0;

	drawWalls();
	createGround();

	drawTankCube();

	createLight();

	// GO!!
	animate();
}

function createLight()
{
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.9 );
	directionalLight.position.set( 0, 1, 1000 );

	scene.add( directionalLight );
}


function fire()
{
	var geometry = new THREE.CubeGeometry( 10, 10, 10 );
	var material = new THREE.MeshLambertMaterial( {color: 0x00ff00} );
	var rocket = new THREE.Mesh( geometry, material );
	var userData = new Object();

	userData["lifeTime"] = 50;

	// life time
	rocket.name = "rocket";
	rocket.userData = userData;

	rocket.applyMatrix(cube.matrix);
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

function drawWalls()
{
	var northWall = createWall();

	northWall.position.z = 10;
	northWall.position.y = 500;

	scene.add(northWall);
	world.push(northWall);

	var westWall = createWall();

	westWall.rotation.z = Math.PI/2;
	westWall.position.z = 10;
	westWall.position.x = 500;

	scene.add(westWall);
	world.push(westWall);


	var southWall = createWall();

	southWall.position.z = 10;
	southWall.position.y = -500;

	scene.add(southWall);
	world.push(southWall);


	var eastWall = createWall();

	eastWall.rotation.z = Math.PI/2;
	eastWall.position.z = 10;
	eastWall.position.x = -500;

	scene.add(eastWall);
	world.push(eastWall);

}

function createWall()
{
	var geometry = new THREE.CubeGeometry( 1000, 10, 20 );
	var material = new THREE.MeshLambertMaterial( {color: 0x778899} );
	var wall = new THREE.Mesh( geometry, material );

	return wall;
}

function createGround()
{
	var geometry = new THREE.PlaneGeometry( 1000, 1000 );
	var material = new THREE.MeshLambertMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
	var plane = new THREE.Mesh( geometry, material );

	//plane.position
	
	scene.add( plane );
}

function drawTankCube()
{
	var geometry = new THREE.CubeGeometry( 20, 20, 10 );
	var material = new THREE.MeshLambertMaterial( {color: 0x00ff00} );
	cube = new THREE.Mesh( geometry, material );

	geometry = new THREE.CubeGeometry( 7.5, 20, 10 );
	material = new THREE.MeshLambertMaterial( {color: 0x00ff00} );
	gun = new THREE.Mesh( geometry, material );
	gun.translateY(15); 
	//cube.position = new THREE.Vector3(100, 100, 100);

	cube.add(gun);
	cube.add(camera);

	camera.position.y = camera.position.y - 50;
	camera.lookAt(cube.position);

	scene.add( cube );
}

/**
 * draws a grid
 * @return {[type]} [description]
 */
function drawGrid()
{
	var gridXY = new THREE.GridHelper(1000, 100);
	
	gridXY.position.set( 0,0,0 );
	gridXY.rotation.x = Math.PI/2;
	gridXY.setColors( new THREE.Color(0x0000FF), new THREE.Color(0x0000FF) );
	
	scene.add(gridXY);
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
	var ray = new THREE.Raycaster(cube.position, vector);
	var intersects = ray.intersectObjects(world, false);

	if (intersects.length > 0) 
	{
	    if (intersects[0].distance < 30) 
	    {
	      breakTank();
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
	matrix.extractRotation( cube.matrix );

	var direction = new THREE.Vector3( 1, 1, 0 );
	direction.applyMatrix4(matrix);

	return direction;
}