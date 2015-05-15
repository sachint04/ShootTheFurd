require.config({
	baseUrl : "./",
	paths : {
		'three' 					: 'Scripts/libs/three.min',
		'cannon' 					: 'Scripts/libs/cannon.min',
		"game" 						: "Game",
		'MTLLoader' 				: 'Scripts/libs/loaders/MTLLoader',
		'OBJLoader' 				: 'Scripts/libs/loaders/OBJLoader',
		'Projector' 				: 'Scripts/libs/renderers/Projector',
		'shell' 					: 'Scripts/Base/utils/Shell'
	},
	shim : {
		'three':{
			exports:'THREE'
		},
		 "cannon":{
		 	exports:'CANNON'
		 },
		 'MTLLoader': {
		 	deps:['three'],
		 	exports: 'MTLLoader'
		 },
		 'OBJLoader' :{
		 	deps:['three'],
		 	exports: 'MTLLoader'
		 },
		 'Projector' :{
		 	deps:['three'],
		 	exports: 'Projector'
		 }

	}
	// ,
	 // waitSeconds: 15
});

require(['game', 
		'shell'], 
function(Game, Shell) {
	var blocker = document.getElementById('blocker');
	var instructions = document.getElementById('instructions');
	var havePointerLock = 'pointerLockElement' in document || 'mozPointerLockElement' in document || 'webkitPointerLockElement' in document;

	
	var game 		= new Game();
	game.setup();


	if (havePointerLock) {

		var element = document.body;

		var pointerlockchange = function(event) {

			if (document.pointerLockElement === element || document.mozPointerLockElement === element || document.webkitPointerLockElement === element) {

				game.controls.enabled = true;

				blocker.style.display = 'none';

			} else {

				game.controls.enabled = false;

				blocker.style.display = '-webkit-box';
				blocker.style.display = '-moz-box';
				blocker.style.display = 'box';

				instructions.style.display = '';

			}

		};
		
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

				element.requestPointerLock();

			}

		}, false);

	} else {

	instructions.innerHTML = 'Your browser doesn\'t seem to support Pointer Lock API';

	}



	window.addEventListener('resize', function(){
        game.camera.aspect = window.innerWidth / window.innerHeight;
        game.camera.updateProjectionMatrix();
        game.renderer.setSize( window.innerWidth, window.innerHeight );
	});



});
