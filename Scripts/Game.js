/**
 * @author Sachin Tumbre
 *
 */
define(['three',
		'vision',
		'physics',
		'utils/Loader',
		'MTLLoader',
		'OBJLoader',
		'Projector',
		'Bird',
		'utils/MathUtils',
		'Objects/FlappyBird',
		'Effects/blast',
		'Objects/Bullet',
		'PointerLockControls',
		'maze',
		'shell'
		], function(THREE, VISION, CannonSetup, Loader, MTLLoader, OBJLoader, Projector, Bird, MathUtils, FlappyBird, blast, Bullet, PointerLockControls , Maze, Shell){
	
	var Game = function(){	
		VISION.call(this);

		this.scene = null;
		this.camera = null;
		this.renderer = null;
		this.container = null;
		this.controls = null;
		this.clock = null;
		this.stats = null;
		this.texture = null;
		this.score = 0;
		this.SCREEN_WIDTH = window.innerWidth;
		this.SCREEN_HEIGHT = window.innerHeight;
		this.raycaster = null;
		this.objGun = null;
		this.gunLight = null;
		this.clock = null;
		this.initX = 0;
		this.initY = 10;
		this.initZ = 0;
		this.initRotY = -(Math.PI);
		this.aEnemy = [];
		this.gunSite = null;
		this.aDeadEnemy = [];
		this.blast = null;
		this.viewline = null;
		this.particles = null;
		this.audioListener = null;
		this.time;
		this.maze;
		
		this.cannonSetup = new CannonSetup();
	}
	
	Game.prototype 					= VISION.prototype;
	Game.prototype.constructor 		= Game;
	
	Game.prototype.setup 			= function(){
		// create main scene
		oGame 			= this;
		this.clock 		= new THREE.Clock();
		this.scene 		= new THREE.Scene();
		this.time 		= Date.now()
		this.maze 		= new Maze();
		// this.scene.fog = new THREE.FogExp2(0xcce0ff, 0.0003);

		// prepare camera
		var VIEW_ANGLE 	= 50, ASPECT = this.SCREEN_WIDTH / this.SCREEN_HEIGHT, NEAR = 1, FAR = 20000;

		this.camera 		= new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
		this.audioListener 	= new THREE.AudioListener();
		//this.camera.add(this.audioListener);
		this.camera.position.set(0,50, 120);
		this.scene.add(this.camera);
		
		this.cannonSetup.init();
		this.controls = new PointerLockControls( this.camera , this.cannonSetup.getSphereBody() );
		// this.controls.lon = -45;

        this.scene.add( this.controls.getObject() );

		var light = new THREE.AmbientLight(0xcccccc);
		// soft white light
		this.scene.add(light);

		// add gun light
		this.gunLight = new THREE.SpotLight(0xffffff);
		this.gunLight.position.y = 500;
		
		this.makeGunSite(function(mesh){
			oGame.gunSite = mesh;
			oGame.gunSite.scale.multiplyScalar(0.1);
			oGame.gunSite.name = "gunsite";
		});
		
		// add simple ground
		var geo = new THREE.PlaneGeometry( 2500, 2500, 5, 5 );
        geo.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
		
		var met = new THREE.MeshBasicMaterial({color:0xcccccc});
		var plane = new THREE.Mesh(geo, met);
		plane.castShadow = true;
        plane.receiveShadow = true;
		plane.position.set(1250, 0, -1250);
		
		this.scene.add(plane);


		// prepare renderer
		this.renderer = new THREE.WebGLRenderer({
			antialias : true
		});
		this.renderer.setSize(this.SCREEN_WIDTH, this.SCREEN_HEIGHT);
		this.renderer.setClearColor(0x0000ff);
		this.renderer.shadowMapEnabled = true;
		this.renderer.shadowMapSoft = true;

		// prepare container
		this.container = document.getElementById('container');
		document.body.appendChild(this.container);
		this.container.appendChild(this.renderer.domElement);

		document.addEventListener('click', this.checkBirdHit)
		window.addEventListener( 'resize', this.onWindowResize, false );

		// load a model
		this.loadTexture();
		
		
	};
	
	Game.prototype.loadTexture 		= function() {
		var oGame 		= this;
		var loader 		= new Loader();
	
		loader.loadTexture(['Assets/Model/MP5K/Tex_0004_1.png'], function(texture){
			console.log('loadTexture and start game '+texture);
			oGame.texture = texture[0];
			oGame.loadModel();
			loader.dispose();
			loader = null;
		}, this);
		
	};
	
	Game.prototype.loadMTLOBJ 		= function() {
		var loader = new Loader(),
		oGame 		= this;
		loader.OBJMTLLoader('Assets/Model/MP5K/MP5K.obj', 'Assets/Model/MP5K/MP5K.mtl', function(object) {
			object.position.y = -80;
			oGame.scene.add(object);
			loader.dispose();
			loader = null;
		}, oGame);

	};
	Game.prototype.udpate 			= function(){
		
	};
	
	Game.prototype.makeGunSite 		= function(_callback, _scope) {
		var oGame 	= _scope,
		mesh 		= null,
		aTexture  	= ['Assets/Texture/gun-sight_alpha.jpg', 'Assets/Texture/gun-sight.jpg'],
		map 		=  null,
		alphaMap 	=  null,
		callback 	= _callback,
		oScope 	  	= _scope,
		loader 		= new Loader();
	
		
		loader.loadTexture(aTexture, function(aTexture, _index){
			alphaMap		= aTexture[0];	
			map 			= aTexture[1];
			var geometry 	= new THREE.PlaneGeometry(100, 100, 10);
			var material 	= new THREE.MeshBasicMaterial({
									color : 0xffffff,
									map : map,
									alphaMap : alphaMap,
									transparent : true
							});
			
			mesh 				= new THREE.Mesh(geometry, material);
			mesh.rotation.x 	= -(Math.PI / 2);
			mesh.doubleSided 	= true;
			callback.call(oGame, mesh);
		}, this); 		
	};
	
	Game.prototype.loadModel 		=  function() {
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
			oGame.objGun = new THREE.Object3D();
			oGame.objGun.add(object)
			object.position.set(-2, -18, 9);
			oGame.camera.add(oGame.objGun);
			//Game.objGun.rotation.x = Math.PI / 2;
			oGame.objGun.position.set(18, -20, -148);
			//object.position.set(20, -35, -130);
			object.rotation.set(Math.PI/22, Math.PI + (Math.PI / 22), 0, 'XYZ');
			// object.rotation.set(0, -Math.PI , 0, 'XYZ');
			oGame.objGun.scale.set(1, 1, 1);
			oGame.scene.add(oGame.gunLight);
			oGame.gunLight.target = oGame.objGun;
			oGame.camera.updateProjectionMatrix();
			
			oGame.animate();

		});
	};

	Game.prototype.createEnemy 		= function() {
		//console.log('create enemy');
		if(this.controls.enabled){
			var material = new THREE.MeshBasicMaterial({
				color : 0xff0000,
				side : THREE.DoubleSide
			});
			var controlObj = this.controls.getObject();
			var pitchObj = this.controls.getPitchObject();
			var delta = this.clock.getDelta();
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
		}
	};

	// Update controls and stats
	Game.prototype.checkBirdHit 	= function(event) {
		event.preventDefault();
		if (this.objGun == null || this.objGun == undefined)
			return;
		var controlObj = this.controls.getObject();
		var pitchObj = this.controls.getPitchObject();
		var delta = this.clock.getDelta();
		var theta = controlObj.rotation.y;
		var phi = pitchObj.rotation.x;
	
		var mouse = new THREE.Vector3();
		mouse.x = (event.clientX / window.innerWidth ) * 2 - 1;
		mouse.y = -(event.clientY / window.innerHeight ) * 2 + 1;
		var raycaster = new THREE.Raycaster()
		var vector = new THREE.Vector3(0, 0, 1).unproject(this.camera);
		var targetDistance = 1000;
		var hitTarget = null;
		raycaster.set(controlObj.position, vector.sub(controlObj.position).normalize());
		if (this.aEnemy.length > 0) {
			var intersections = raycaster.intersectObject(this.aEnemy[0]);
			if (intersections && intersections.length > 0) {
				////console.log('hitObject intersections.length ' + intersections.length);
				for (var i = 0; i < intersections.length; i++) {
					var hitObject = intersections[i].object;
					// hitObject.scale.multiplyScalar(2);
					if (hitObject.name == 'enemy') {
						this.score++;
						document.getElementById('score').innerHTML = this.score;
						targetDistance = hitObject.getDistance();
						hitTarget = hitObject;
						break;
					}
				}
	
			} else {
			}
	
		} else {
		}
		addBullet(this.objGun.matrixWorld, theta, phi, 100, targetDistance, hitTarget);
		this.objGun.bRecoile = true;
		createGunSmoke();
		//buildRay();
	};
	
	Game.prototype.addBullet 		= function(matrixWorld, theta, phi, speed, distance, hitTarget) {
		this.controls.getObject().updateMatrixWorld();
		var v = new THREE.Vector3();
		v.setFromMatrixPosition(this.objGun.matrixWorld);
	
		var bullet = new Bullet(v, theta, phi, speed, distance, hitTarget);
		if (this.objGun.bullets == undefined) {
			this.objGun.bullets = [];
		}
		this.objGun.bullets.push(bullet);
		this.scene.add(bullet)
	}

	Game.prototype.buildRay 		= function(_hitObj) {
	// object.rotation.set(Math.PI / 18, Math.PI +(Math.PI /16), 0, 'XYZ');
	var Game = this;
	var controlObj = this.controls.getObject();
	var pitchObj = this.controls.getPitchObject();
	var theta = controlObj.rotation.y;
	var phi = pitchObj.rotation.x;
	var hitObj = _hitObj;

	if (this.targetRay) {
		this.scene.remove(this.targetRay);
		this.targetRay = null;
	}
	controlObj.updateMatrixWorld();
	var rayStart = new THREE.Vector3();
	rayStart.setFromMatrixPosition(this.objGun.matrixWorld);

	//rayStart.copy(controlObj.position.clone().sub(getLocation(theta, phi, 100)));
	var rayEnd = rayStart.clone().sub(getLocation(theta, -(phi - (Math.PI / 2)), 1000));
	//console.log('Y  = '+(theta * (180/Math.PI))+ ' | X = '+ ( -(phi - (Math.PI /2)) * (-180/Math.PI)));
	if (hitObj && hitObj != undefined) {
		rayEnd = hitObj.position.clone();
		//controlObj.position.clone().add(getLocation(theta, phi, 590));
	}
	// rayEnd.x += -(Math.PI/2);
	this.targetRay = createRay(rayStart, rayEnd);

	var timer = setTimeout(function() {
		Game.scene.remove(Game.targetRay);
		Game.targetRay = null;
		clearTimeout(timer);
	}, 20);
	this.scene.add(this.targetRay);
}

	Game.prototype.createBlast 		= function(enemy) {
		var gemoetry = new Bird();
		var Game = this;
		this.blast = new Blast(gemoetry, 0xff0000, 70, 30, 5, 0.03, function() {
			//console.log('blast over');
			Game.scene.remove(Game.particles);
			Game.particles = null;
			Game.blast = null;
	
			Game.createEnemy();
		}, this);
		this.particles = this.blast.createParticle()
		this.scene.add(this.particles);
		this.particles.position.copy(enemy.position.clone());
		var sound1 = new THREE.Audio(this.audioListener);
		sound1.load('Assets/Sound/bomb-02.ogg');
		sound1.setRefDistance(enemy.getDistance());
		//this.particles.add(sound1);
		this.removeEnemy();
		//				particles.rotation.copy((enemy.rotation.clone()))
	};

	Game.prototype.createGunSmoke 	= function () {
			var Game = this;
		var gemoetry = new THREE.SphereGeometry(2, 5, 5);
		if (this.objGun.smoke) {
			this.objGun.remove(this.objGun.smoke);
			this.objGun.smoke = null;
			this.objGun.blast = null;
			this.objGun.remove(this.objGun.sound);
			this.objGun.sound = null;
		}
		this.objGun.blast = new Blast(gemoetry, 0xff00ff, 5, 10, 5, 0.05, function() {
			Game.objGun.remove(Game.objGun.smoke);
			Game.objGun.smoke = null;
			Game.objGun.blast = null;
			Game.objGun.remove(Game.objGun.sound);
			Game.objGun.sound = null;
		}, this);
	
		this.objGun.smoke = this.objGun.blast.createParticle();
		this.objGun.add(this.objGun.smoke);
	
		this.objGun.sound = new THREE.Audio(this.audioListener);
		this.objGun.sound.load('Assets/Sound/gun_fire.mp3');
		this.objGun.sound.setRefDistance(10);
		//this.objGun.add(Game.objGun.sound);

	};
	
	Game.prototype.render 			= function() {
	//var pointer = document.getElementById("pointer");
	//pointer.style.left = mouse
	Shell.log('render() this.controls.enabled = '+ this.controls.enabled);
		if(this.controls.enabled){
			var controlObj = this.controls.getObject();
			var pitchObj = this.controls.getPitchObject();
			var delta = this.clock.getDelta();
			this.controls.update( (Date.now() - this.time) * 20 );
		 	this.time = Date.now();
			//this.controls.update(delta);
			
			var theta = controlObj.rotation.y;
			var phi = (Math.PI / 2) - pitchObj.rotation.x;
		
			this.updateEnemy(theta, phi, controlObj.position.clone(), delta);
			this.updateGunPosition(theta, phi, controlObj.position.clone());
			this.gunRecoile(delta);
			this.moveBullet(delta);
			this.checkGunFire(delta);
			this.checkBirdKill(delta);
			this.updateWorld();
			//	//console.log(' theta= '+(theta * (180/Math.PI))+ ' | phi = '+ (phi * (180/Math.PI)));
			this.renderer.render(this.scene, this.camera);
		};
	
	};

	Game.prototype.updateWorld 		= function(){
		var dt = 1/60;
		this.cannonSetup.world.step(dt);
		 // Update box positions
		for(var i=0; i<this.maze.aBoxes.length; i++){
		    this.maze.aWalls[i].position.copy(this.maze.aBoxes[i].position);
		    this.maze.aWalls[i].quaternion.copy(this.maze.aBoxes[i].quaternion);
		}

	}
	
	Game.prototype.updateEnemy 		= function(theta, phi, position, delta){
		if (this.aEnemy.length > 0) {
			var diff = this.aEnemy[0].animate();
			var diff = this.aEnemy[0].attack(position, theta, phi, 2, delta);
			this.aEnemy[0].rotation.set(phi - (Math.PI / 2), theta + (Math.PI / 2), (Math.PI / 8), 'YXZ');
			if (diff <= 5) {
				this.removeEnemy();
				this.createEnemy();
			}
	
		}else{
				this.createEnemy();
		}
	}
	
	Game.prototype.gunRecoile 		= function(delta){
		if (this.objGun.bRecoile) {
			if (!recoile(this.objGun, delta)) {
				this.objGun.bRecoile = false;
			}
		}
	};
	
	Game.prototype.updateGunPosition = function(theta, phi, position){
			this.gunSite.position.copy(position.clone().sub(this.getLocation(theta, phi, 150)));
			this.gunSite.rotation.set(-(phi - (Math.PI / 2)), theta, 0, 'YXZ');
	};
	
	Game.prototype.checkGunFire  	 = function(delta){
		if (this.objGun.blast) {
			this.objGun.blast.animateParticles(delta);
		}
	}
	
	Game.prototype.checkBirdKill  	 = function(delta){
		if (this.blast) {
			this.blast.animateParticles(delta);
		}
	}
	
	Game.prototype.removeEnemy 		= function() {
		for (var i = 0; i < this.aEnemy.length; i++) {
			var enemy = this.aEnemy[i];
			this.scene.remove(enemy);
			enemy.geometry.dispose();
			enemy.material.dispose();
			enemy = null;
	
		}
		this.aEnemy = [];
	
	};
	
	Game.prototype.getLocation 		= function(theta, phi, radius) {
		var x = (radius * Math.sin(phi) * Math.sin(theta));
		var y = (radius * Math.cos(phi));
		var z = (radius * Math.sin(phi) * Math.cos(theta));
		return new THREE.Vector3(x, -y, z);
	};
	// Initialize lesson on page load
	
	Game.prototype.createRay 		= function(p_vStart, p_vEnd) {
		var mat = new THREE.LineBasicMaterial({
			color : 0xffffff,
			linewidth : 7
		}), geometry = new THREE.Geometry();
		geometry.vertices.push(p_vStart);
		geometry.vertices.push(p_vEnd);
	
		var line = new THREE.Line(geometry, mat);
		return line;
	};
	
	Game.prototype.smoke 			= function() {
		var smokeTexture = THREE.ImageUtils.loadTexture(['./smoke.png']);
		var smokeMaterial = new THREE.ParticleBasicMaterial({
			map : smokeTexture,
			transparent : true,
			blending : THREE.AdditiveBlending,
			size : 50,
			color : 0x111111
		});
	};
	
	Game.prototype.recoile 			= function(_obj, _delta, _max) {
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
	};
	
	Game.prototype.moveBullet 		= function() {
		if (this.objGun.bullets == undefined)
			return;
		for (var i = 0; i < this.objGun.bullets.length; i++) {
			var _bullet = this.objGun.bullets[i];
			var success = _bullet.move();
			console.log('bullet move ' + success);
			if (!success) {
				if (_bullet.hasHitTarget()) {
					createBlast(_bullet.getHitTarget());
				}
				this.scene.remove(_bullet);
				_bullet.geometry.dispose();
				_bullet.material.dispose();
				_bullet = null;
				this.objGun.bullets.splice(i, 1);
			}
		}
	};

	return Game;
});



/*
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
		this.camera.position.set(0,50, 120);
		this.scene.add(this.camera);
		
		this.controls = new PointerLockControls( this.camera , CannonSetup.sphereBody );
		// this.controls.lon = -45;
        this.scene.add( this.controls.getObject() );

		var light = new THREE.AmbientLight(0xcccccc);
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
		var geo = new THREE.PlaneGeometry( 2500, 2500, 5, 5 );
          geo.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
		var met = new THREE.MeshBasicMaterial({color:0xcccccc});
		var plane = new THREE.Mesh(geo, met);
		plane.castShadow = true;
        plane.receiveShadow = true;
		plane.position.set(1250, 0, -1250);
		this.scene.add(plane);

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

		document.addEventListener('click', checkBirdHit)
		window.addEventListener( 'resize', onWindowResize, false );

		// load a model
		Game.loadTexture();
		

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
			oGame.objGun = new THREE.Object3D();
			oGame.objGun.add(object)
			object.position.set(-2, -18, 9);
			oGame.camera.add(oGame.objGun);
			//Game.objGun.rotation.x = Math.PI / 2;
			Game.objGun.position.set(18, -20, -148);
			//object.position.set(20, -35, -130);
			object.rotation.set(Math.PI/22, Math.PI + (Math.PI / 22), 0, 'XYZ');
			// object.rotation.set(0, -Math.PI , 0, 'XYZ');
			oGame.objGun.scale.set(1, 1, 1);
			oGame.scene.add(oGame.gunLight);
			Game.gunLight.target = Game.objGun;
			oGame.camera.updateProjectionMatrix();
			
			animate();

		});
	},
	createEnemy : function() {
		//console.log('create enemy');
		if(Game.controls.enabled){
			var material = new THREE.MeshBasicMaterial({
				color : 0xff0000,
				side : THREE.DoubleSide
			});
			var controlObj = Game.controls.getObject();
			var pitchObj = Game.controls.getPitchObject();
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
			
		}
	}
};

// Update controls and stats
function checkBirdHit(event) {
	event.preventDefault();
	if (Game.objGun == null || Game.objGun == undefined)
		return;
	var controlObj = Game.controls.getObject();
	var pitchObj = Game.controls.getPitchObject();
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
	var pitchObj = Game.controls.getPitchObject();
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
var  time = Date.now();
function render() {
	//var pointer = document.getElementById("pointer");
	//pointer.style.left = mouse
	if(Game.controls.enabled){
		
		var controlObj = Game.controls.getObject();
		var pitchObj = Game.controls.getPitchObject();
		var delta = Game.clock.getDelta();
		Game.controls.update( (Date.now() - time) * 20 );
	 	time = Date.now();
		//Game.controls.update(delta);
		
		var theta = controlObj.rotation.y;
		var phi = (Math.PI / 2) - pitchObj.rotation.x;
	
		updateEnemy(theta, phi, controlObj.position.clone(), delta);
		updateGunPosition(theta, phi, controlObj.position.clone());
		gunRecoile(delta);
		moveBullet(delta);
		checkGunFire(delta);
		checkBirdKill(delta);
		updateWorld();
		//	//console.log(' theta= '+(theta * (180/Math.PI))+ ' | phi = '+ (phi * (180/Math.PI)));
		Game.renderer.render(Game.scene, Game.camera);
	}

}
var updateWorld = function(){
		var dt = 1/60;
		CannonSetup.world.step(dt);
		 // Update box positions
		for(var i=0; i<this.maze.aBoxes.length; i++){
		    Maze.aWalls[i].position.copy(Maze.aBoxes[i].position);
		    Maze.aWalls[i].quaternion.copy(Maze.aBoxes[i].quaternion);
		}

}
var updateEnemy = function(theta, phi, position, delta){
	if (Game.aEnemy.length > 0) {
		var diff = Game.aEnemy[0].animate();
		var diff = Game.aEnemy[0].attack(position, theta, phi, 2, delta);
		Game.aEnemy[0].rotation.set(phi - (Math.PI / 2), theta + (Math.PI / 2), (Math.PI / 8), 'YXZ');
		if (diff <= 5) {
			removeEnemy();
			Game.createEnemy();
		}

	}else{
			Game.createEnemy();
	}
}
var gunRecoile = function(delta){
	if (Game.objGun.bRecoile) {
		if (!recoile(Game.objGun, delta)) {
			Game.objGun.bRecoile = false;
		}
	}
}
var updateGunPosition = function(theta, phi, position){
		Game.gunSite.position.copy(position.clone().sub(getLocation(theta, phi, 150)));
		Game.gunSite.rotation.set(-(phi - (Math.PI / 2)), theta, 0, 'YXZ');
}

var checkGunFire  	 = function(delta){
	if (Game.objGun.blast) {
		Game.objGun.blast.animateParticles(delta);
	}
}
var checkBirdKill  	 = function(delta){
	if (Game.blast) {
		Game.blast.animateParticles(delta);
	}
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

*/