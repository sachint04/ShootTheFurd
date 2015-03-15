function Blast(_geometry, _color, _size, _speed, _offset, _decay, _callback, _callbackscope) {
	console.log('Blast Constructor');
	this.geometry 		= _geometry;
	this.particleSize 	= _size;
	this.color 			= _color;
	this.callback 		= _callback;
	this.callbackScope  = _callbackscope;
	this.accel 			= _speed;
	this.offset			= _offset;
	this.decay			= _decay;
	this.material 		= 	this.material = new THREE.PointCloudMaterial({
		color : this.color,
		size : this.particleSize,
		map : THREE.ImageUtils.loadTexture('Assets/Texture/transition/transition1.png'),
		blending : THREE.AdditiveBlending,
		transparent : true
	});
	
	
	
}


Blast.prototype.createParticle 		= function() {
	// material = new THREE.PointCloudMaterial({color:0xffffff, size:10});
	// var geometry 					= new THREE.SphereGeometry(2, 10, 10);
	var particleSystem 				= new THREE.ParticleSystem(this.geometry, this.material);
	particleSystem.sortParticles 	= true;
	return particleSystem;
}

Blast.prototype.animateParticles 	= function(p_delta) {
	//console.log('animateParticles  '+ p_delta);
	if (!this.geometry)
		return;
	var vertices = this.geometry.vertices, startAngle = 0;
	for (var i = 0; i < vertices.length; i++) {
		var vertex = vertices[i], 
		accel = (Math.random() * this.accel) + this.offset; 
		// decay = 0.03;

		if (vertex.angle == undefined) {
			vertex.accel = accel;
			vertex.angle = (Math.random() * 180) - (90);
			vertex.angleoffset = 5;
		}
		if (vertex.angle == 180) {
			vertex.angleoffset = vertex.angleoffset * -1;
		} else if (vertex.angle == 0) {
			vertex.angleoffset = vertex.angleoffset * -1;
		}
		//vertex.angleoffset -= 0.01;
		vertex.angle += vertex.angleoffset;
		vertex.accel -= this.decay;
		//console.log('this.material.color.r = '+ this.material.color.r);
		if (this.material.color.r > 0) {
			vertex.y += vertex.accel * p_delta;
			vertex.x += (Math.cos(vertex.angle * (Math.PI / 180)) * vertex.accel) * p_delta;
			vertex.z += (Math.cos(vertex.angle * (Math.PI / 180)) * vertex.accel) * p_delta;
			this.material.color.r -= this.decay * p_delta;
		}else {
			this.callback.call(this.callbackScope);
			break;
			
		}

	}
	// material.color = Math.random() * 0xffffff;
}


/*
 * 			Game.aDeadEnemy.splice[this.index, 1];
			Game.scene.remove(this);
			this.geometry = null;
			Game.createEnemy();

 */