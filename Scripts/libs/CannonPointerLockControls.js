/**
 * @author mrdoob / http://mrdoob.com/
 * @author schteppe / https://github.com/schteppe
 */
define(['three','cannon', 'shell'], function(THREE, CANNON, Shell) {

	var PointerLockControls = function(camera, _cannonBody) {

		this.eyeYPos = 2;
		// eyes are 2 meters above the ground
		this.velocityFactor = 0.5;
		this.jumpVelocity = 20;
		this.scope = this;
		this.cannonBody = _cannonBody;
		this.pitchObject = new THREE.Object3D();
		this.pitchObject.add(camera);

		this.yawObject = new THREE.Object3D();
		this.yawObject.position.y = 2;
		this.yawObject.add(this.pitchObject);

		this.quat = new THREE.Quaternion();

		this.moveForward = false;
		this.moveBackward = false;
		this.moveLeft = false;
		this.moveRight = false;

		this.canJump = false;

		this.contactNormal = new CANNON.Vec3();
		// Normal in the contact, pointing *out* of whatever the player touched
		this.upAxis = new CANNON.Vec3(0, 1, 0);

		this.velocity = this.cannonBody.velocity;

		this.PI_2 = Math.PI / 2;

		this.enabled = false;

		// Moves the camera to the Cannon.js object position and adds velocity to the object if the run key is down
		this.inputVelocity = new THREE.Vector3();
		this.euler = new THREE.Euler();


		this.onMouseMove = this.onMouseMove.bind(this);
		this.onKeyDown 	= this.onKeyDown.bind(this);
		this.onKeyUp 	= this.onKeyUp.bind(this);
		this.onCollide 	= this.onCollide.bind(this);
		this.update 	= this.update.bind(this);

		document.addEventListener('mousemove', this.onMouseMove, false);
		document.addEventListener('keydown', this.onKeyDown, false);
		document.addEventListener('keyup', this.onKeyUp, false);
		this.cannonBody.addEventListener("collide", this.onCollide, false);
	};

	PointerLockControls.prototype.onCollide = function(e) {
		var contact = e.contact;

		// contact.bi and contact.bj are the colliding bodies, and contact.ni is the collision normal.
		// We do not yet know which one is which! Let's check.
		if (contact.bi.id == this.cannonBody.id)// bi is the player body, flip the contact normal
			contact.ni.negate(this.contactNormal);
		else
			this.contactNormal.copy(contact.ni);
		// bi is something else. Keep the normal as it is

		// If contactNormal.dot(upAxis) is between 0 and 1, we know that the contact normal is somewhat in the up direction.
		if (this.contactNormal.dot(this.upAxis) > 0.5)// Use a "good" threshold value between 0 and 1 here!
			this.canJump = true;
	};

	PointerLockControls.prototype.onKeyDown = function(event) {

		switch ( event.keyCode ) {

			case 38:
			// up
			case 87:
				// w
				this.moveForward = true;
				break;

			case 37:
			// left
			case 65:
				// a
				this.moveLeft = true;
				break;

			case 40:
			// down
			case 83:
				// s
				this.moveBackward = true;
				break;

			case 39:
			// right
			case 68:
				// d
				this.moveRight = true;
				break;

			case 32:
				// space
				if (this.canJump === true) {
					this.velocity.y = this.jumpVelocity;
				}
				this.canJump = false;
				break;
		}

	};

	PointerLockControls.prototype.onKeyUp = function(event) {

		switch( event.keyCode ) {

			case 38:
			// up
			case 87:
				// w
				this.moveForward = false;
				break;

			case 37:
			// left
			case 65:
				// a
				this.moveLeft = false;
				break;

			case 40:
			// down
			case 83:
				// a
				this.moveBackward = false;
				break;

			case 39:
			// right
			case 68:
				// d
				this.moveRight = false;
				break;

		}

	};

	PointerLockControls.prototype.update = function(delta) {

		if (this.enabled === false)
			return;

		delta *= 0.1;

		this.inputVelocity.set(0, 0, 0);

		if (this.moveForward) {
			this.inputVelocity.z = -this.velocityFactor * delta;
		}
		if (this.moveBackward) {
			this.inputVelocity.z = this.velocityFactor * delta;
		}

		if (this.moveLeft) {
			this.inputVelocity.x = -this.velocityFactor * delta;
		}
		if (this.moveRight) {
			this.inputVelocity.x = this.velocityFactor * delta;
		}

		// Convert velocity to world coordinates
		this.euler.x = this.pitchObject.rotation.x;
		this.euler.y = this.yawObject.rotation.y;
		this.euler.order = "XYZ";
		this.quat.setFromEuler(this.euler);
		this.inputVelocity.applyQuaternion(this.quat);
		//quat.multiplyVector3(inputVelocity);

		// Add to the object
		this.velocity.x += this.inputVelocity.x;
		this.velocity.z += this.inputVelocity.z;

		this.yawObject.position.copy(this.cannonBody.position);
	};

	PointerLockControls.prototype.onMouseMove = function(event) {

		if (this.enabled === false)
			return;

		var movementX = event.movementX || event.mozMovementX || event.webkitMovementX || 0;
		var movementY = event.movementY || event.mozMovementY || event.webkitMovementY || 0;

		this.yawObject.rotation.y -= this.movementX * 0.002;
		this.pitchObject.rotation.x -= this.movementY * 0.002;

		this.pitchObject.rotation.x = Math.max(-this.PI_2, Math.min(this.PI_2, this.pitchObject.rotation.x));
	};

	PointerLockControls.prototype.getRotation = function() {
		return new THREE.Vector3(this.pitchObject.rotation.x, this.yawObject.rotation.y, 0);
	}

	PointerLockControls.prototype.getObject = function() {
		return this.yawObject;
	};

	PointerLockControls.prototype.getPitchObject = function() {
		return this.pitchObject;
	}
	PointerLockControls.prototype.getDirection = function(targetVec) {
		targetVec.set(0, 0, -1);
		this.quat.multiplyVector3(targetVec);
	}

	return PointerLockControls;
});
