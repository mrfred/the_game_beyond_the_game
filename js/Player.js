/**
 * this class represensts the player
 */

function Player () {

	this.object3d = null;
	this.mesh = null;
	this.destination = null;

	this.create3dObject();

}

Player.prototype = {

	constructor : Player,

	create3dObject : function ()
	{
		var geometry = new THREE.CubeGeometry( 20, 20, 10 );
		var material = new THREE.MeshLambertMaterial( {color: 0x00ff00} );
		this.mesh = new THREE.Mesh( geometry, material );

		geometry = new THREE.CubeGeometry( 20, 7.5, 10 );
		material = new THREE.MeshLambertMaterial( {color: 0x00ff00} );
		gun = new THREE.Mesh( geometry, material );
		gun.translateX(15); 

		this.mesh.add(gun);
		//this.mesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), Math.PI * 1.0);

		this.mesh.translateZ(5);
		
		this.object3d = new THREE.Object3D();
		this.object3d.add(this.mesh);
	},

	move : function ()
	{
		if (this.object3d.position.distanceTo(this.destination) > 1)
			this.object3d.translateOnAxis(this.getDirection(), 2);
	},

	lookAt : function (target)
	{
		direction = this.getDirection();
	    //console.log(direction);

	    var mouseDir = target.clone().sub(this.object3d.position);
	    //console.log(mouseDir);

	    var angle = direction.angleTo(mouseDir);
	    //console.log(angle);

		var right = new THREE.Vector3();
	    right.crossVectors(direction, new THREE.Vector3(0, 0, 1));
	    //console.log(right);

	    var dot = right.dot(mouseDir);
	    //console.log(dot);
	    if (dot < 0)
	    	this.mesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), angle);
	    else
	    	this.mesh.rotateOnAxis(new THREE.Vector3(0, 0, 1), -angle);

	},

	isDirectPath : function (target, world)
	{
		var isDirectPath = true;
		var direction = this.getDirection();
		var ray = new THREE.Raycaster(this.object3d.position, direction);
		var intersects = ray.intersectObjects(world, false);
		var pathDistance = this.object3d.position.distanceTo(target);

		//console.log(player.position);
		console.log(intersects[0].distance + " " + pathDistance)

		if (intersects.length > 0) 
			if (intersects[0].distance < pathDistance) 
		    	isDirectPath = false;

		return isDirectPath;
	},

	getDirection : function()
	{
		var matrix = new THREE.Matrix4();
		matrix.extractRotation( this.mesh.matrixWorld );

		var direction = new THREE.Vector3( 1, 0, 0 );
		direction.applyMatrix4(matrix);

		return direction;
	},

	detectCollision : function(world)
	{
		var vector = this.getDirection();
		var ray = new THREE.Raycaster(this.object3d.position, vector);
		var intersects = ray.intersectObjects(world, false);

		if (intersects.length > 0) 
		{
		    if (intersects[0].distance < 30) 
		    {
		    	this.destination = this.object3d.position.clone();
		    }
		}
	}

}