angular
	.module('ngSharepoint')
	.provider('$sp', function() {
		var siteUrl = '';
		var connMode = 'JSOM'; //possible values: JSOM, REST
		var token = false;
		var autoload = true;

		return {
			setSiteUrl: function (newUrl) {
				siteUrl = newUrl;
			},
			setConnectionMode: function(newConnMode) { //Only JSOM Supported for now
				if (newConnMode === 'JSOM' || newConnMode === 'REST') {
					connMode = newConnMode;
				}
			},
			setAccessToken: function(newToken) {
				token = newToken;
			},
			setAutoload: function(newAutoload) {
				autoload = newAutoload;
			},
			$get: function() {
				return ({
					getSiteUrl: function() {
						return siteUrl;
					},
					getConnectionMode: function() {
						return connMode;
					},
					getAccessToken: function(token) {
						return token;
					},
					getContext: function() {
						return new SP.ClientContext(siteUrl);
					},
					getAutoload: function() {
						return autoload;
					}
				});
			}
		};
	});
