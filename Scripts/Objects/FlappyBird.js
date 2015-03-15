/**
 * @author acer
 */

var FlappyBird = function(_material, _phase, _distance, _speed, _theta, _phi){
	 // var geo = new THREE.BoxGeometry(5,5,5);
	// THREE.Mesh.call(this, geo, _material);
	THREE.Mesh.call(this, new Bird(), _material);
	
	this.phase = _phase;
	this.speed = _speed;
	this.distance = _distance;
	this.theta = 	_theta,
	this.phi 	= _phi,
	this.clock = new THREE.Clock();
	// this.rotation.set(-( this.phi - (Math.PI /4)), this.theta , 0 , 'YXZ');
	this.animate = this.animate.bind(this);
	
}
FlappyBird.prototype 				= Object.create(THREE.Mesh.prototype);
FlappyBird.prototype.constructor 	= FlappyBird;

FlappyBird.prototype.animate = function(){
	// var target_angle 	= _target.rotation.clone();
	this.phase = ( this.phase + ( Math.max( 0, this.rotation.y ) + 0.1 )  ) % 100;
	var posY = (Math.sin(this.phase ) * 5) * this.clock.getDelta() ;
	this.geometry.vertices[4].y = this.geometry.vertices[5].y = posY; 
	this.geometry.verticesNeedUpdate = true;
}

FlappyBird.prototype.attack = function(_target, _theta, _phi, _speed, _delta){
	if(this.distance <= 0)return;
	
	var _position 		= _target.position.clone();
	var phi 			= _phi;
	var theta 			= _theta;
	var _position 		= _position.sub( this.getLocation(this.theta, this.phi, this.distance));
	this.setLocation(_position);
	this.distance -= (this.speed * _delta); 
//	console.log(' theta= '+(theta * (180/Math.PI))+ ' | phi = '+ (phi * (180/Math.PI)));
//	 console.log(' _position = '+JSON.stringify(_position));
	return this.distance;
}

FlappyBird.prototype.setSpeed = function(_speed){
	this.speed = _speed;
}
FlappyBird.prototype.setLocation = function(_position){
	this.position.copy(_position);
}

FlappyBird.prototype.getDistance = function(theta, phi, radius){
	return this.distance;
}
FlappyBird.prototype.getLocation = function(theta, phi, radius){
	
	var x = (radius * Math.sin(phi)*Math.sin(theta));
	var y = (radius * Math.cos(phi)); 				
	var z = (radius * Math.sin(phi)*Math.cos(theta));
	
	return new THREE.Vector3(x,-y,z);
}



