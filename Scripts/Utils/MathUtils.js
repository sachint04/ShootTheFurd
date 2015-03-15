/**
 * @author acer
 */
var MathUtils = {
		// this.targetPosition.x = position.x + 100 * Math.sin( this.phi ) * Math.cos( this.theta );
		// this.targetPosition.y = position.y + 100 * Math.cos( this.phi );
		// this.targetPosition.z = position.z + 100 * Math.sin( this.phi ) * Math.sin( this.theta );
		getSphericalCoordinates : function(theta, phi , radius){
			var x = (radius * Math.sin(phi) * Math.sin(theta));
				var y = (radius * Math.cos(phi));
				var z = (radius * Math.sin(phi) * Math.cos(theta));
				return new THREE.Vector3(x, -y, z);			
		}

}