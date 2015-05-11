define([], function(){
	
	var Shell = {
		log :  function(p_sStr){
			if(window.console){
				console.log(p_sStr);
			};
		}
	};
	
	
	return Shell;
});
