/**
 * @author Sachin Tumbre
 */

var Game = {
	scene : null,
	camera : null,
	renderer : null,
	container : null,
	controls : null,
	clock : null,
	stats : null,
	texture : null,
	score : 0,
	SCREEN_WIDTH : window.innerWidth,
	SCREEN_HEIGHT : window.innerHeight,
	raycaster : null,
	objGun : null,
	gunLight : null,
	clock : null,
	initX : 0,
	initY : 10,
	initZ : 0,
	initRotY : -(Math.PI),
	aEnemy : [],
	gunSite : null,
	aDeadEnemy : [],
	blast : null,
	viewline : null,
	particles : null,
	audioListener : null,

	init : function() {// Initialization

		// create main scene
		oGame = this;
		this.clock = new THREE.Clock();
		this.scene = new THREE.Scene();
		// this.scene.fog = new THREE.FogExp2(0xcce0ff, 0.0003);

		// prepare camera
		var VIEW_ANGLE = 50, ASPECT = this.SCREEN_WIDTH / this.SCREEN_HEIGHT, NEAR = 1, FAR = 20000;

		this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
		this.audioListener = new THREE.AudioListener();
		this.camera.add(this.audioListener);
		this.scene.add(this.camera);
		// this.camera.position.set(0, 100, 300);
		//  this.camera.lookAt(new THREE.Vector3(0,0,0));

		//prepare point locker
		var blocker = document.getElementById('blocker');
		var instructions = document.getElementById('instructions');
		this.controls = new THREE.PointerLockControls(this.camera);
		this.scene.add(this.controls.getObject());
		var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

		if (havePointerLock) {

			var element = document.body;
			var pointerlockchange = function(event) {
				if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {
					Game.controls.enabled = true;
					//blocker.style.display = 'none';
				} else {
					oGame.controls.enabled = false;
					blocker.style.display = '-webkit-box';
					blocker.style.display = '-moz-box';
					blocker.style.display = 'box';
					instructions.style.display = '';
				}

			}
			var pointerlockerror = function(event) {

				instructions.style.display = '';

			}
			// Hook pointer lock state change events
			document.addEventListener('pointerlockchange', pointerlockchange, false);
			document.addEventListener('mozpointerlockchange', pointerlockchange, false);
			document.addEventListener('webkitpointerlockchange', pointerlockchange, false);

			document.addEventListener('pointerlockerror', pointerlockerror, false);
			document.addEventListener('mozpointerlockerror', pointerlockerror, false);
			document.addEventListener('webkitpointerlockerror', pointerlockerror, false);

			instructions.addEventListener('click', function(event) {
				instructions.style.display = 'none';

				// Ask the browser to lock the pointer
				element.requestPointerLock = element.requestPointerLock || element.mozRequestPointerLock || element.webkitRequestPointerLock;

				if (/Firefox/i.test(navigator.userAgent)) {

					var fullscreenchange = function(event) {

						if (document.fullscreenElement === element || document.mozFullscreenElement === element || document.mozFullScreenElement === element) {

							document.removeEventListener('fullscreenchange', fullscreenchange);
							document.removeEventListener('mozfullscreenchange', fullscreenchange);

							element.requestPointerLock();
						}

					}

					document.addEventListener('fullscreenchange', fullscreenchange, false);
					document.addEventListener('mozfullscreenchange', fullscreenchange, false);
					element.requestFullscreen = element.requestFullscreen || element.mozRequestFullscreen || element.mozRequestFullScreen || element.webkitRequestFullscreen;

					element.requestFullscreen();

				} else {

					document.addEventListener('click', checkBirdHit)
					element.requestPointerLock();

					// prepare renderer
					Game.renderer = new THREE.WebGLRenderer({
						antialias : true
					});
					Game.renderer.setSize(Game.SCREEN_WIDTH, Game.SCREEN_HEIGHT);
					Game.renderer.setClearColor(0x0000ff);
					Game.renderer.shadowMapEnabled = true;
					Game.renderer.shadowMapSoft = true;

					// prepare container
					Game.container = document.getElementById('container');
					document.body.appendChild(Game.container);
					Game.container.appendChild(Game.renderer.domElement);

					// add spot light
					var spLight = new THREE.SpotLight(0xffffff, 1.75, 2000, Math.PI / 3);
					spLight.castShadow = true;
					spLight.position.set(-100, 300, -50);
					// Game.scene.add(spLight);

					var light = new THREE.AmbientLight(0x404040);
					// soft white light
					Game.scene.add(light);

					// add gun light
					Game.gunLight = new THREE.SpotLight(0xffffff);
					Game.gunLight.position.y = 500;

					Game.makeGunSite(function(mesh){
						Game.gunSite = mesh;
						Game.gunSite.scale.multiplyScalar(0.1);
						Game.gunSite.name = "gunsite";
	
						//Game.scene.add(Game.gunSite);
						
					});

					// // add simple ground
					var ground = new THREE.Mesh(new THREE.BoxGeometry(10000, 10000, 1), new THREE.MeshLambertMaterial({
						color : 0x999999
					}));
					ground.receiveShadow = true;
					ground.position.set(0, -300, 0);
					ground.rotation.x = -Math.PI / 2;
					Game.scene.add(ground);

					// load a model
					Game.loadTexture();

				}

			}, false);

		} else {

			instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

		}
		// this.loadMTLOBJ()
	},
	loadTexture : function() {
		var oGame 		= this;
		var loader 		= new Loader();
		var callback = function(texture){
			console.log('loadTexture and start game '+texture);
			oGame.texture = texture[0];
			Game.loadModel();
			loader.dispose();
			loader = null;
		};
		loader.loadTexture(['Assets/Model/MP5K/Tex_0004_1.png'], callback, this);
		
	},
	loadMTLOBJ : function() {
		var loader = new Loader(),
		oGame 		= this;
		loader.OBJMTLLoader('Assets/Model/MP5K/MP5K.obj', 'Assets/Model/MP5K/MP5K.mtl', function(object) {
			object.position.y = -80;
			oGame.scene.add(object);
			loader.dispose();
			loader = null;
		}, oGame);

	},
	makeGunSite : function(_callback, _scope) {
		var oGame 	= _scope,
		mesh 		= null,
		aTexture  	= ['Assets/Texture/gun-sight_alpha.jpg', 'Assets/Texture/gun-sight.jpg'],
		map 		=  null,
		alphaMap 	=  null,
		callback 	= _callback,
		oScope 	  	= _scope,
		loader 		= new Loader();
	
		var onTextureLoaded = function(aTexture, _index){
			alphaMap	= aTexture[0];	
			map 		= aTexture[1];
			var geometry = new THREE.PlaneGeometry(100, 100, 10);
			var material = new THREE.MeshBasicMaterial({
									color : 0xffffff,
									map : map,
									alphaMap : alphaMap,
									transparent : true
							});
			
			mesh = new THREE.Mesh(geometry, material);
			mesh.rotation.x = -(Math.PI / 2);
			mesh.doubleSided = true;
			callback.call(oGame, mesh);
		}
		
		loader.loadTexture(aTexture, onTextureLoaded, this); 		
	},
	loadModel : function() {
		// prepare loader and load the model
		var oGame = this;
		var oLoader = new THREE.OBJLoader();
		oLoader.load('Assets/Model/MP5K/MP5K.obj', function(object, materials) {

			// var material = new THREE.MeshFaceMaterial(materials);
			var material2 = new THREE.MeshLambertMaterial({
				color : 0xa65e00
			});
			// oGame.objGun = object;
			object.name = "gun";
			object.traverse(function(child) {
				if ( child instanceof THREE.Mesh) {

					// apply custom material
					child.material.map = oGame.texture;

					// enable casting shadows
					child.castShadow = true;
					child.receiveShadow = true;
					// oGame.objGun.rotation._z = 90 ;
				}
			});

			var geo = new THREE.BoxGeometry(5, 5, 5);
			var met = new THREE.MeshBasicMaterial({
				color : 0xffff00
			});

			// Game.objGun = new THREE.Mesh(geo, met);
			Game.objGun = new THREE.Object3D();
			Game.objGun.add(object)
			object.position.set(-2, -18, 9);
			oGame.camera.add(oGame.objGun);
			//Game.objGun.rotation.x = Math.PI / 2;
			Game.objGun.position.set(18, -15, -148);
			//object.position.set(20, -35, -130);
			object.rotation.set(Math.PI / 16, Math.PI + (Math.PI / 18), 0, 'XYZ');
			// object.rotation.set(0, -Math.PI , 0, 'XYZ');
			//oGame.objGun.scale.set(1, 1, 1);
			oGame.scene.add(oGame.gunLight);
			Game.gunLight.target = Game.objGun;
			oGame.camera.updateProjectionMatrix();

			Game.createEnemy();
			animate();

		});
	},
	createEnemy : function() {
		//console.log('create enemy');
		var material = new THREE.MeshBasicMaterial({
			color : 0xff0000,
			side : THREE.DoubleSide
		});
		Game.controls.update();
		var controlObj = Game.controls.getObject();
		var pitchObj = Game.controls.pitchObject();
		var delta = Game.clock.getDelta();
		var theta = controlObj.rotation.y + (Math.random(Math.PI / 2) - Math.PI / 4);
		var phi = (Math.PI / 2) - pitchObj.rotation.x;

		var birdMesh = new FlappyBird(material, 8, (Math.random() * 50 + 700), 100, theta, phi);
		var camRotation = this.controls.getRotation();
		birdMesh.scale.set(5, 5, 5);
		birdMesh.name = 'enemy';
		this.scene.add(birdMesh);

		if (this.aEnemy.length == undefined) {
			this.aEnemy.push(birdMesh);
		} else {

			this.aEnemy[0] = birdMesh;
		}
		render();
	}
};

// Update controls and stats
function checkBirdHit(event) {
	 Game.controls.update(Game.clock.getDelta());
	event.preventDefault();
	if (Game.objGun == null || Game.objGun == undefined)
		return;
	var controlObj = Game.controls.getObject();
	var pitchObj = Game.controls.pitchObject();
	var delta = Game.clock.getDelta();
	var theta = controlObj.rotation.y;
	var phi = pitchObj.rotation.x;

	var mouse = new THREE.Vector3();
	mouse.x = (event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = -(event.clientY / window.innerHeight ) * 2 + 1;
	var raycaster = new THREE.Raycaster()
	var vector = new THREE.Vector3(0, 0, 1).unproject(Game.camera);
	var targetDistance = 1000;
	var hitTarget = null;
	raycaster.set(controlObj.position, vector.sub(controlObj.position).normalize());
	if (Game.aEnemy.length > 0) {
		var intersections = raycaster.intersectObject(Game.aEnemy[0]);
		if (intersections && intersections.length > 0) {
			////console.log('hitObject intersections.length ' + intersections.length);
			for (var i = 0; i < intersections.length; i++) {
				var hitObject = intersections[i].object;
				// hitObject.scale.multiplyScalar(2);
				if (hitObject.name == 'enemy') {
					Game.score++;
					document.getElementById('score').innerHTML = Game.score;
					targetDistance = hitObject.getDistance();
					hitTarget = hitObject;
					break;
				}
			}

		} else {
		}

	} else {
	}
	addBullet(Game.objGun.matrixWorld, theta, phi, 100, targetDistance, hitTarget);
	Game.objGun.bRecoile = true;
	createGunSmoke();
	//buildRay();
};

function addBullet(matrixWorld, theta, phi, speed, distance, hitTarget) {
	Game.controls.getObject().updateMatrixWorld();
	var v = new THREE.Vector3();
	v.setFromMatrixPosition(Game.objGun.matrixWorld);

	var bullet = new Bullet(v, theta, phi, speed, distance, hitTarget);
	if (Game.objGun.bullets == undefined) {
		Game.objGun.bullets = [];
	}
	Game.objGun.bullets.push(bullet);
	Game.scene.add(bullet)
}

function buildRay(_hitObj) {
	// object.rotation.set(Math.PI / 18, Math.PI +(Math.PI /16), 0, 'XYZ');
	var controlObj = Game.controls.getObject();
	var pitchObj = Game.controls.pitchObject();
	var theta = controlObj.rotation.y;
	var phi = pitchObj.rotation.x;
	var hitObj = _hitObj;

	if (Game.targetRay) {
		Game.scene.remove(Game.targetRay);
		Game.targetRay = null;
	}
	controlObj.updateMatrixWorld();
	var rayStart = new THREE.Vector3();
	rayStart.setFromMatrixPosition(Game.objGun.matrixWorld);

	//rayStart.copy(controlObj.position.clone().sub(getLocation(theta, phi, 100)));
	var rayEnd = rayStart.clone().sub(getLocation(theta, -(phi - (Math.PI / 2)), 1000));
	//console.log('Y  = '+(theta * (180/Math.PI))+ ' | X = '+ ( -(phi - (Math.PI /2)) * (-180/Math.PI)));
	if (hitObj && hitObj != undefined) {
		rayEnd = hitObj.position.clone();
		//controlObj.position.clone().add(getLocation(theta, phi, 590));
	}
	// rayEnd.x += -(Math.PI/2);
	Game.targetRay = createRay(rayStart, rayEnd);

	var timer = setTimeout(function() {
		Game.scene.remove(Game.targetRay);
		Game.targetRay = null;
		clearTimeout(timer);
	}, 20);
	Game.scene.add(Game.targetRay);
}

function createBlast(enemy) {
	var gemoetry = new Bird();
	Game.blast = new Blast(gemoetry, 0xff0000, 70, 30, 5, 0.03, function() {
		//console.log('blast over');
		Game.scene.remove(Game.particles);
		Game.particles = null;
		Game.blast = null;

		Game.createEnemy();
	}, this);
	Game.particles = Game.blast.createParticle()
	Game.scene.add(Game.particles);
	Game.particles.position.copy(enemy.position.clone());
	var sound1 = new THREE.Audio(Game.audioListener);
	sound1.load('Assets/Sound/bomb-02.ogg');
	sound1.setRefDistance(enemy.getDistance());
	Game.particles.add(sound1);
	removeEnemy();
	//				particles.rotation.copy((enemy.rotation.clone()))
};

function createGunSmoke() {
	var gemoetry = new THREE.SphereGeometry(2, 5, 5);
	if (Game.objGun.smoke) {
		Game.objGun.remove(Game.objGun.smoke);
		Game.objGun.smoke = null;
		Game.objGun.blast = null;
		Game.objGun.remove(Game.objGun.sound);
		Game.objGun.sound = null;
	}
	Game.objGun.blast = new Blast(gemoetry, 0xff00ff, 5, 10, 5, 0.05, function() {
		Game.objGun.remove(Game.objGun.smoke);
		Game.objGun.smoke = null;
		Game.objGun.blast = null;
		Game.objGun.remove(Game.objGun.sound);
		Game.objGun.sound = null;
	}, this);

	Game.objGun.smoke = Game.objGun.blast.createParticle();
	Game.objGun.add(Game.objGun.smoke);

	Game.objGun.sound = new THREE.Audio(Game.audioListener);
	Game.objGun.sound.load('Assets/Sound/gun_fire.mp3');
	Game.objGun.sound.setRefDistance(10);
	Game.objGun.add(Game.objGun.sound);

}

// Render the scene
function render() {
	//var pointer = document.getElementById("pointer");
	//pointer.style.left = mouse
	Game.controls.update();
	var controlObj = Game.controls.getObject();
	var pitchObj = Game.controls.pitchObject();
	var delta = Game.clock.getDelta();
	var theta = controlObj.rotation.y;
	var phi = (Math.PI / 2) - pitchObj.rotation.x;
	////console.log('controls rotation = '+ JSON.stringify(Game.controls.getRotation()) );
	if (Game.aEnemy.length > 0) {
		var diff = Game.aEnemy[0].animate(controlObj, 2, delta);
		var diff = Game.aEnemy[0].attack(controlObj, theta, phi, 2, delta);
		Game.aEnemy[0].rotation.set(phi - (Math.PI / 2), theta + (Math.PI / 2), (Math.PI / 8), 'YXZ');
		if (diff <= 5) {
			removeEnemy();
			Game.createEnemy();
		}

	}
	if (Game.objGun.bRecoile) {
		if (!recoile(Game.objGun, delta)) {
			Game.objGun.bRecoile = false;
		}
	}

	Game.gunSite.position.copy(controlObj.position.clone().sub(getLocation(theta, phi, 150)));
	Game.gunSite.rotation.set(-(phi - (Math.PI / 2)), theta, 0, 'YXZ');

	moveBullet();

	if (Game.objGun.blast) {
		Game.objGun.blast.animateParticles(delta);
	}
	if (Game.blast) {
		Game.blast.animateParticles(delta);
	}
	//	//console.log(' theta= '+(theta * (180/Math.PI))+ ' | phi = '+ (phi * (180/Math.PI)));
	Game.renderer.render(Game.scene, Game.camera);

}

var removeEnemy = function() {
	for (var i = 0; i < Game.aEnemy.length; i++) {
		var enemy = Game.aEnemy[i];
		Game.scene.remove(enemy);
		enemy.geometry.dispose();
		enemy.material.dispose();
		enemy = null;

	}
	Game.aEnemy = [];

}
var getLocation = function(theta, phi, radius) {
	var x = (radius * Math.sin(phi) * Math.sin(theta));
	var y = (radius * Math.cos(phi));
	var z = (radius * Math.sin(phi) * Math.cos(theta));
	return new THREE.Vector3(x, -y, z);
}
// Initialize lesson on page load
function initGame() {
	Game.init();

}

function onWindowResize() {

	Game.SCREEN_Height = window.innerWidth / 2;
	Game.SCREEN_HEIGHT = window.innerHeight / 2;

	Game.camera.aspect = window.innerWidth / window.innerHeight;
	Game.camera.updateProjectionMatrix();

	Game.renderer.setSize(window.innerWidth, window.innerHeight);

}

function updateGun() {

}

// init 3D stuff

function makeSkybox(urls, size) {
	// //console.log(urls + ' | '+ size);
	var skyboxCubemap = THREE.ImageUtils.loadTextureCube(urls);

	skyboxCubemap.format = THREE.RGBFormat;

	var skyboxShader = THREE.ShaderLib['cube'];
	skyboxShader.uniforms['tCube'].value = skyboxCubemap;

	return new THREE.Mesh(new THREE.BoxGeometry(size, size, size), new THREE.ShaderMaterial({
		fragmentShader : skyboxShader.fragmentShader,
		vertexShader : skyboxShader.vertexShader,
		uniforms : skyboxShader.uniforms,
		depthWrite : false,
		side : THREE.BackSide
	}));
};

function makePlatform(jsonUrl, textureUrl, textureQuality) {
	var placeholder = new THREE.Object3D();

	var texture = THREE.ImageUtils.loadTexture(textureUrl);
	texture.anisotropy = textureQuality;

	var loader = new THREE.JSONLoader();
	loader.load(jsonUrl, function(geometry) {

		geometry.computeFaceNormals();

		var platform = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
			map : texture
		}));

		platform.name = "platform";

		placeholder.add(platform);
	});

	return placeholder;
};

function createRay(p_vStart, p_vEnd) {
	var mat = new THREE.LineBasicMaterial({
		color : 0xffffff,
		linewidth : 7
	}), geometry = new THREE.Geometry();
	geometry.vertices.push(p_vStart);
	geometry.vertices.push(p_vEnd);

	var line = new THREE.Line(geometry, mat);
	return line;
}

function smoke() {
	var smokeTexture = THREE.ImageUtils.loadTexture(['./smoke.png']);
	var smokeMaterial = new THREE.ParticleBasicMaterial({
		map : smokeTexture,
		transparent : true,
		blending : THREE.AdditiveBlending,
		size : 50,
		color : 0x111111
	});
}

function recoile(_obj, _delta, _max) {
	if (_obj.startPos == undefined) {
		_obj.startPos = _obj.position.clone();
		_obj.recoilAccel = 8;
	}

	var force = 4

	_obj.position.z += _obj.recoilAccel

	_obj.recoilAccel -= force;

	if (_obj.recoilAccel <= 0) {
		_obj.recoilAccel = -10;
		if (_obj.position.z <= _obj.startPos.z) {
			_obj.position.z = _obj.startPos.z;
			_obj.startPos = undefined;
			return false;
		}
	}
	return true;
}

function moveBullet() {
	if (Game.objGun.bullets == undefined)
		return;
	for (var i = 0; i < Game.objGun.bullets.length; i++) {
		var _bullet = Game.objGun.bullets[i];
		var success = _bullet.move();
		console.log('bullet move ' + success);
		if (!success) {
			if (_bullet.hasHitTarget()) {
				createBlast(_bullet.getHitTarget());
			}
			Game.scene.remove(_bullet);
			_bullet.geometry.dispose();
			_bullet.material.dispose();
			_bullet = null;
			Game.objGun.bullets.splice(i, 1);
		}
	}
}