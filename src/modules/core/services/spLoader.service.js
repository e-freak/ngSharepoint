angular
	.module('ngSharepoint')
	.factory('$spLoader', function($q, $http, $sp, $spLog) {
		var scripts = {};
		var SPLoader = {};
		SPLoader.loadScript = function(lib) {
			var query = $q(function(resolve, reject) {
				var element = document.createElement('script');
				element.type = 'text/javascript';
				if (lib[0] === lib[1] === '/') {
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
		SPLoader.loadScripts = function(label, libs) {
			var queries = [];
			libs.forEach(function(lib) {
				queries.push(SPLoader.loadScript(lib));
			});
			var query = $q.all(queries);
			scripts[label] = query;
			return query;
		};
		SPLoader.waitUntil = function(lib) {
			return $q(function(resolve, reject) {
				if (scripts.hasOwnProperty(lib)) {
					scripts[lib].then(resolve, reject);
				}else if ($sp.getAutoload()) {
					reject('Library was not requested');
				}else {
					resolve();
				}
			});
		};
		SPLoader.query = function(queryObject) {
			//TODO: Request the Request Digest in SPContext
			return $q(function(resolve, reject) {
				$http({
					method: 'POST',
					url: $sp.getSiteUrl() + '_api/contextInfo',
					headers: {
						'X-FORMS_BASED_AUTH_ACCEPTED': 'f',
						'Accept': 'application/json; odata=verbose',
						'Content-Type': 'application/json; odata=verbose'						
					}
				}).then(function(data) {
					var query = {
						url: $sp.getSiteUrl() + queryObject.url,
						method: queryObject.method,
						headers: {
							//'X-FORMS_BASED_AUTH_ACCEPTED': 'f',
							'X-RequestDigest': data.d.GetContextWebInformation.FormDigestValue,
							'Accept': 'application/json; odata=verbose',
							'Content-Type': 'application/json; odata=verbose'						
						}
					};
					if ($sp.getConnectionMode() === 'REST' && !$sp.getAccessToken()) {
						SPLoader.waitUntil('SP.RequestExecutor.js').then(function() {
							if (queryObject.hasOwnProperty('data') &&
								angular.isDefined(queryObject.data) &&
								queryObject !== null) {
								query.body = queryObject.data;							
							}
							query.success = resolve;
							query.error = reject;
							new SP.RequestExecutor($sp.getSiteUrl()).executeAsync(query);						
						});
					}else {
						if (queryObject.hasOwnProperty('data') &&
							angular.isDefined(queryObject.data) &&
							queryObject !== null) {
							query.data = queryObject.data;							
						}
						query.headers.Authorization = 'Bearer ' + $sp.getAccessToken();
						$http(query).then(resolve, reject);
					}
				});
			}).catch($spLog.error);
		};
		return (SPLoader);
	});