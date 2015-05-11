/**
 * @author Sachin Tumbre
 */
define(['three'], function(THREE) {
	var createGunSmoke = function() {
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
	};
})
