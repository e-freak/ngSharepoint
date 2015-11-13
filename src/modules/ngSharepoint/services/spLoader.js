angular
	.module('ngSharepoint')
	.factory('$spLoader', ['$q', '$http', '$sp', function($q, $http, $sp) {
		var scripts = {};
		var SPLoader = {};
		SPLoader.loadScript = function(lib) {
			var query = $q(function(resolve, reject) {
				var element = document.createElement('script');
				element.type = 'text/javascript';
				element.src = $sp.getSiteUrl() + '_layouts/15/' + lib;
				element.onload = resolve;
				element.onerror = reject;
				document.head.appendChild(element);
			});
			scripts[lib] = query;
			return query;
		};
		SPLoader.waitUntil = function(lib) {
			if (scripts.hasOwnProperty(lib)) {
				return scripts[lib];
			}else {
				return $q(function(resolve) {
					resolve();
				});
			}
		};
		SPLoader.query = function(queryObject) {
			var query = {
				url: $sp.getSiteUrl() + queryObject.url,
				method: queryObject.method,
				headers: {
					'Accept': 'application/json; odata=verbose',
					'Content-Type': 'application/json; odata=verbose'						
				}
			};
			if ($sp.getConnectionMode() === 'REST' && !$sp.getAccessToken()) {
				return $q(function(resolve, reject) {
					SPLoader.waitUntil('SP.RequestExecutor.js').then(function() {
						query.body = queryObject.data;
						query.success = resolve;
						query.error = reject;
						new SP.RequestExecutor($sp.getSiteUrl()).executeAsync(query);						
					});
				});
			}else {
				return $q(function(resolve, reject) {
					query.data = queryObject.data;
					query.headers.Authorization = 'Bearer ' + $sp.getAccessToken();
					$http(query).then(resolve, reject);
				});
			}
		};
		return (SPLoader);
	}]);