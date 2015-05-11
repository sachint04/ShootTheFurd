define([
		'three',
		'Effects/Blast'
		], 
	function(THREE, Blast){
	var WeponController = function(p_oWepon, p_AudioListener){
		this.wepon = p_oWepon;
		this.blast = null;
		this.smoke = null;
		this.sound = null;
		this.audioListener = p_AudioListener;
		this.soundURL= 'Assets/Sound/gun_fire.mp3';
		this.refDistance= 10;
	};
	
	WeponController.prototype.attack = function(){
		if (this.smoke) {
			this.wepon.remove(this.smoke);
			this.wepon.remove(this.sound);
			this.smoke = null;
			this.blast = null;
			this.sound = null;
		}
		this.blast = createBlast(smoke)
		
		this.smoke = createSmoke(blast);
		
		this.wepon.add(this.smoke);

		this.smoke = this.blast.createParticle();
	
	};
	
	WeponController.prototype.update = function(){
		
	}
	WeponController.prototype.isShooting = function(){
		return (this.smoke != null);
	}
	
	
	WeponController.prototype.playSound = function() {
		this.sound = new THREE.Audio(this.audioListener);
		this.sound.load(this.soundURL);
		this.sound.setRefDistance(10);
		this.wepon.add(this.sound);
	}
	var createBlast = function() {
		var gemoetry = new THREE.SphereGeometry(2, 5, 5);
		var blast = new Blast(gemoetry, 0xff00ff, 5, 10, 5, 0.05);
		return blast;
	}
	
	return WeponController;
});
