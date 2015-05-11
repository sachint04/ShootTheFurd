define(['vision'], function(Vision){
	//STF - Shoot The Fird!!
	var STF = function(){
		
		Shell.log('STF Game!');
	};
	 
	STF.prototype = Vision.prototype;
	STF.prototype.constructor = STF;
	
	STF.prototype.init = function(){
		this.start();
		this.pause();
		this.resume();
		this.end();
	};
	
	return STF;
	
})
