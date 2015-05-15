/**
 *Bullet 
 */
define(['three', 'shell'], function(THREE, Shell){
 	var Bullet = function(_vStart, _theta, _phi, _speed, _maxDistance, _hitTarget){
 		THREE.Mesh.call(this, new THREE.SphereGeometry(3, 12, 12), new THREE.MeshBasicMaterial({color:0xffcc00}));
		Shell.log('Bullet Constructor')
		this.hitTarget = _hitTarget;
		this.theta = _theta;
		this.starPos = _vStart;
		this.phi = _phi;
		this.speed = _speed,
		this.distance = 0;
		this.maxDistance = _maxDistance;
		this.rotation.set(this.phi, this.theta,  0, 'YXZ');
 		
 	}
 	
 	Bullet.prototype = Object.create(THREE.Mesh.prototype);
	Bullet.prototype.constructor = Bullet;
	
	
	Bullet.prototype.hasHitTarget = function(){
		return (this.hitTarget  != null)
	}
	Bullet.prototype.getHitTarget = function(){
		return this.hitTarget;
	}
	
	Bullet.prototype.move = function(){
		if(this.distance < this.maxDistance ){
			this.distance += this.speed;
			var v2 = this.starPos.sub(MathUtils.getSphericalCoordinates(this.theta, - (this.phi - (Math.PI /2)), this.distance ));
			this.position.copy(v2);
			return true;
		}	
		return false;
	
	}	
 		
 	return Bullet;
});
/*
function Bullet(_vStart, _theta, _phi, _speed, _maxDistance, _hitTarget){
	
	THREE.Mesh.call(this, new THREE.SphereGeometry(3, 12, 12), new THREE.MeshBasicMaterial({color:0xffcc00}));
	
	Shell.log('Bullet Constructor')
	this.hitTarget = _hitTarget;
	this.theta = _theta;
	this.starPos = _vStart;
	this.phi = _phi;
	this.speed = _speed,
	this.distance = 0;
	this.maxDistance = _maxDistance;
	this.rotation.set(this.phi, this.theta,  0, 'YXZ');
	
}

Bullet.prototype = Object.create(THREE.Mesh.prototype);
Bullet.prototype.constructor = Bullet;


Bullet.prototype.hasHitTarget = function(){
	return (this.hitTarget  != null)
}
Bullet.prototype.getHitTarget = function(){
	return this.hitTarget;
}

Bullet.prototype.move = function(){
	if(this.distance < this.maxDistance ){
		this.distance += this.speed;
		var v2 = this.starPos.sub(MathUtils.getSphericalCoordinates(this.theta, - (this.phi - (Math.PI /2)), this.distance ));
		this.position.copy(v2);
		return true;
	}	
	return false;

}


*/