angular
	.module('ngSharepoint')
	.factory('$spLoader', ['$q', '$http', '$sp', '$spLog', function($q, $http, $sp, $spLog) {
		var scripts = {};
		var SPLoader = {};
		SPLoader.loadScript = function(lib) {
			var query = $q(function(resolve, reject) {
				var element = document.createElement('script');
				element.type = 'text/javascript';
				if (lib.startsWith('//')) {
					element.src = lib;
				}else {
					element.src = $sp.getSiteUrl() + '_layouts/15/' + lib;					
				}
				element.onload = resolve;
				element.onerror = reject;
				document.head.appendChild(element);
			});
			scripts[lib] = query;
			return query;
		};
		SPLoader.waitUntil = function(lib) {
			return $q(function(resolve, reject) {
				if (scripts.hasOwnProperty(lib)) {
					scripts[lib].then(resolve, reject);
				}else if ($sp.getAutoload()) {
					reject("Library was not requested");
				}else {
					resolve();
				}
			});
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
						if (queryObject.hasOwnProperty('data') && queryObject.data !== undefined && queryObject !== null) {
							query.body = queryObject.data;							
						}
						query.success = resolve;
						query.error = reject;
						new SP.RequestExecutor($sp.getSiteUrl()).executeAsync(query);						
					});
				});
			}else {
				return $q(function(resolve, reject) {
					if (queryObject.hasOwnProperty('data') && queryObject.data !== undefined && queryObject !== null) {
						query.data = queryObject.data;							
					}
					query.headers.Authorization = 'Bearer ' + $sp.getAccessToken();
					$http(query).then(resolve, reject);
				});
			}
		};
		return (SPLoader);
	}]);