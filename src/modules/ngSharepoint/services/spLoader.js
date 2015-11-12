angular
	.module('ngSharepoint')
	.factory('$spLoader', ['$q', '$http', '$sp', function($q, $http, $sp) {
		var scripts = {};
		return ({
			loadScript: function(lib) {
				var query = $q(function(resolve, reject) {
					var loaded = false;
					var element = document.createElement('script');
					element.type = 'text/javascript';
					element.src = '_layouts/15/' + lib;
					element.onload = resolve;
					element.onerror = reject;
				});
				scripts[lib] = query;
				return query;
			},
			waitUntil: function(lib) {
				return query[url];
			},
			query: function(queryObject) {
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
						query.body = queryObject.data;
						query.success = resolve;
						query.error = reject;
						new SP.RequestExecutor($sp.getSiteUrl()).executeAsync(query);
					});
				}else {
					return $q(function(resolve, reject) {
						query.data = queryObject.data;
						query.headers.Authorization = 'Bearer ' + $sp.getAccessToken;
						$http(query).then(resolve, reject);
					});
				}
			}
		});
	}]);