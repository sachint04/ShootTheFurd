/**
 * @author Sachin Tumbre
 */
define(['shell'], function(Shell) {

	var Loader 						= function() {
		Shell.log('Loader Construtor');
	};
	//	callback.call(oGame, texture);
	Loader.prototype.loadMTLOBJ 	= function(_objPath, _objMatPath, _callback, _scope) {
		var objPath = _objPath, objMatPath = _objMatPath, callback = _callback, oGame = _scope;
		var loader = new THREE.OBJMTLLoader();
		loader.load('Assets/Model/MP5K/MP5K.obj', 'Assets/Model/MP5K/MP5K.mtl', function(object) {
			callback.call(oGame, object);
		}, function() {
			Shell.log('Loader: loadMTLOBJ() onProgress ');
		}, function() {
			Shell.log('Loader: loadMTLOBJ() onError ');
		});

	};
	
	Loader.prototype.loadTexture 	= function(aPath, _callback, _scope) {
		//Shell.log('Loader loadTexture ()'+ aPath);
		var oGame = _scope, callback = _callback, loader = new THREE.ImageLoader(this.manager), aTexture = aPath.slice(0), nCount = 0, texture = new THREE.Texture();

		var onImageLoad = function(image) {
			Shell.log('image Loaded : ' + image.src);
			var source = image.src, texture = new THREE.Texture();
			texture.image = image;
			texture.needsUpdate = true;
			Shell.log('nCount  = ' + nCount + ' | aTexture.length = 	' + aTexture.length)

			for (var i = 0; i < aTexture.length; i++) {
				// Shell.log('aTexture[i]  = ' + aTexture[i]+ ' | source = 	'+source)
				// Shell.log('source.indexOf (aTexture[i])  = ' + source.indexOf (aTexture[i]))
				if (source.indexOf(aTexture[i]) != -1) {
					aTexture[i] = texture;
					nCount++;
					Shell.log('nCount  = ' + nCount + ' | aTexture.length = 	' + aTexture.length)
					if (nCount == aTexture.length) {
						callback.call(oGame, aTexture)
					}
					break;
				}
			}
		}
		var onProgress = function(e) {
			Shell.log('Loader loadTexture() onProgress ' + e);
		}
		var onError = function(e) {

			Shell.log('Loader loadTexture() onError ' + e);
		}
		for (var i = 0; i < aPath.length; i++) {
			loader.load(aPath[i], onImageLoad, onProgress, onError);
		}
	};

	 Loader.prototype.dispose = function() {
			Shell.log('Loader dispose');
	 }
	return Loader;
});

