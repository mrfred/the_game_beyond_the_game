

var DungeonStructures = {
	
	tileSize: 1,

	CreateWall: function(x, y) {

		var geometry = new THREE.CubeGeometry( this.tileSize, this.tileSize, this.tileSize / 2 );
		var material = new THREE.MeshLambertMaterial( {color: 0x778899} );
		var wall = new THREE.Mesh( geometry, material );

		wall.position.x = x * this.tileSize;
		wall.position.y = y * this.tileSize;

		return wall;
	},

	CreateGround: function(x, y, w, h) {

		var geometry = new THREE.PlaneGeometry( w, h, 1 );
		var material = new THREE.MeshLambertMaterial( {color: 0xffff00, side: THREE.DoubleSide} );
		var plane = new THREE.Mesh( geometry, material );

		plane.position.x = x * this.tileSize;
		plane.position.y = y * this.tileSize;

		return plane;
	}
}