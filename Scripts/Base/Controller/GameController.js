/**
 * @author acer
 */
define(['shell'], function(Shell){
	
	var Vision = function(){
		
		this.animate = this.animate.bind(this);
		this.render = this.render.bind(this);
	};
	
	Vision.prototype.init = function(){
		Shell.log("Vision initiated !!");
	};
	
	Vision.prototype.start = function(){
		Shell.log("State Changed to 'start'!!");
	};
	
	Vision.prototype.pause = function(){
		Shell.log("State Changed to 'pause'!!");
	};
	 
	Vision.prototype.resume = function(){
		Shell.log("State Changed to 'resume'!!");
	};
	 
	
	Vision.prototype.animate = function(){
		//Shell.log("State Changed to 'animate'!!");
		requestAnimationFrame(this.animate);
		this.render();
	}; 
	
	Vision.prototype.render = function(){
		Shell.log('BaseController render()');
	}
	Vision.prototype.end = function(){
		Shell.log("State Changed to 'end'!!");
	}; 
	return Vision;
})
