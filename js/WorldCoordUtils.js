/**
 *
 *
 */

function WorldCoordinatesUtils () {

 	this.planeZ = new THREE.Plane( new THREE.Vector3( 0, 0, 1 ), 0 );
	this.mv = new THREE.Vector3( 0, 0, 0.5 );
	this.projector = new THREE.Projector();
 }

WorldCoordinatesUtils.prototype = {

	constructor : WorldCoordinatesUtils,

	getWorldCoordinates: function (iMousePosition, oWorldPosition)
	{	
		this.mv.x = iMousePosition.x;
		this.mv.y = iMousePosition.y;

		var raycaster = this.projector.pickingRay(this.mv, camera);
		var pos = raycaster.ray.intersectPlane(this.planeZ);

		oWorldPosition.x = pos.x;
		oWorldPosition.y = pos.y;
	}
}