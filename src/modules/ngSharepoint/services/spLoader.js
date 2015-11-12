angular
	.module('ngSharepoint')
	.factory('$spLoader', ['$q', '$sp', function($q, $sp) {
		return ({
			loadScript: function(url) {
				return $q(function(resolve, reject) {
					var loaded = false;
					var element = document.createElement('script');
					element.type = 'text/javascript';
					element.src = url;
					element.onload = resolve;
					element.onerror = reject;
				});
			}
		});
	}]);