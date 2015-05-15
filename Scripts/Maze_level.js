define(['three', 'cannon'], function(THREE, CANNON){
	var Maze = function(){
		this.aWalls=[];
		this.aBoxes =[];
		this.world = null;
		this.scene= null;
		this.spwanPoints = [];
	};
	
	Maze.prototype.level 				= function(_scene, _world){
		this.scene = _scene;
		this.world = _world;
		var map = 	'  XXXXXXXXX\n'+
					'    	       X\n'+
					'X S XXXXX     X\n'+
					'X   XXXXX     X\n'+
					'X  S          X\n'+
					'X  S    XX    X\n'+
					'X     XXXX    X\n'+
					'X   S         X\n'+
					'XXXXXXXXXXXXXXX\n';

		map = map.split('\n');
		for(var i= 0; i < map.length;  i++){
			for(var j= 0; j < map[i].length;  j++){
				this.addVoxel(map[i].charAt(j), i , j, map.length, map[0].length);
			}
		}
	};
	
	Maze.prototype.addVoxel 			=  function(type, row, col, rowCount, colCount){
		//console.log('addVoxel {  type = '+ type+' | row = '+row+' | col = '+col);
		var Maze = this;
		var horizontal_unit = 300;
		var vertical_unit 	=	300;
		var zSize = rowCount * horizontal_unit;
		var xSize = colCount * vertical_unit;
		
		var z = (row * -horizontal_unit) + (horizontal_unit/2) ;
		var x = (col * horizontal_unit) + (vertical_unit/2);
		
		var halfExtents = new CANNON.Vec3(horizontal_unit/ 2, vertical_unit/2,horizontal_unit/2);
        var boxShape = new CANNON.Box(halfExtents);
		
		switch(type){
			case ' ' :break;
			
			case 'S' :
				this.spwanPoints.push(new THREE.Vector3(x, 0 , z));
			break;
			case 'X' :
	       		var boxBody = new CANNON.Body({ mass: 0});
            	boxBody.addShape(boxShape);
               	boxBody.position.set(x , vertical_unit * 0.5, z);
				this.world.add(boxBody);
				this.aWalls.push(boxBody);
			
			
				var	brickmat 		= new THREE.MeshPhongMaterial();
				brickmat.map 		= THREE.ImageUtils.loadTexture( 'Assets/Texture/brick_diffuse.jpg' );
				brickmat.map.anisotropy = 2;
				var geo 	= new THREE.BoxGeometry(horizontal_unit, vertical_unit, horizontal_unit);
				var mesh 	= new THREE.Mesh(geo, brickmat);
				mesh.position.set(x , vertical_unit * 0.5, z);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
				Maze.scene.add(mesh);
				Maze.aBoxes.push(mesh);
				break;
								
		}
	};
	
	return Maze;
})
